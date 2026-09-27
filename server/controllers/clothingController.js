import { query } from '../config/db.js';
import imageStorageService from '../services/imageStorageService.js';
import {
  DEFAULT_THRESHOLDS,
  enrichClothingItem,
  calculateWashStatus,
  STATUS_TYPES,
} from '../utils/statusCalculator.js';

/**
 * Get all clothes for authenticated user with search, filter, and sort
 */
export async function getClothes(req, res) {
  try {
    const userId = req.user.userId;
    const { search, category, status, sort } = req.query;

    let sql = `SELECT * FROM clothing WHERE user_id = $1`;
    const params = [userId];
    let paramIndex = 2;

    // Filter by category
    if (category && category !== 'All') {
      sql += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // Search by name, category, color, or style
    if (search && search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      sql += ` AND (
        LOWER(name) LIKE $${paramIndex} OR
        LOWER(category) LIKE $${paramIndex} OR
        LOWER(COALESCE(color, '')) LIKE $${paramIndex} OR
        LOWER(COALESCE(style, '')) LIKE $${paramIndex} OR
        LOWER(COALESCE(material, '')) LIKE $${paramIndex}
      )`;
      params.push(searchTerm);
      paramIndex++;
    }

    // Sorting
    switch (sort) {
      case 'recently_worn':
        // Most recently worn first (NULLs last)
        sql += ` ORDER BY last_worn DESC NULLS LAST, created_at DESC`;
        break;
      case 'least_recently_worn':
        // Never worn or oldest worn first
        sql += ` ORDER BY last_worn ASC NULLS FIRST, created_at ASC`;
        break;
      case 'most_worn':
        sql += ` ORDER BY lifetime_wear_count DESC, current_wear_count DESC`;
        break;
      case 'category':
        sql += ` ORDER BY category ASC, name ASC`;
        break;
      case 'name':
        sql += ` ORDER BY name ASC`;
        break;
      case 'recently_added':
      default:
        sql += ` ORDER BY created_at DESC`;
        break;
    }

    const result = await query(sql, params);

    // Enrich all items with dynamic status fields
    let items = result.rows.map(enrichClothingItem);

    // Filter by status if specified
    if (status && status !== 'All') {
      items = items.filter((item) => item.status === status);
    }

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (err) {
    console.error('getClothes error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve wardrobe items.',
    });
  }
}

/**
 * Get single clothing item by ID with wear and wash history
 */
export async function getClothingById(req, res) {
  try {
    const userId = req.user.userId;
    const clothingId = req.params.id;

    const itemResult = await query(
      `SELECT * FROM clothing WHERE clothing_id = $1 AND user_id = $2`,
      [clothingId, userId]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Clothing item not found.',
      });
    }

    const item = enrichClothingItem(itemResult.rows[0]);

    // Fetch wear history
    const wearHistoryResult = await query(
      `SELECT wear_id, worn_date FROM wear_history 
       WHERE clothing_id = $1 
       ORDER BY worn_date DESC`,
      [clothingId]
    );

    // Fetch wash history
    const washHistoryResult = await query(
      `SELECT wash_id, wash_date FROM wash_history 
       WHERE clothing_id = $1 
       ORDER BY wash_date DESC`,
      [clothingId]
    );

    return res.status(200).json({
      success: true,
      data: {
        ...item,
        wearHistory: wearHistoryResult.rows,
        washHistory: washHistoryResult.rows,
      },
    });
  } catch (err) {
    console.error('getClothingById error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve clothing details.',
    });
  }
}

/**
 * Create a new clothing item
 */
export async function createClothing(req, res) {
  try {
    const userId = req.user.userId;
    const { name, category, color, style, material, wash_threshold, image_url } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a clothing name.' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Please select a clothing category.' });
    }

    // Process image: from uploaded file, or provided URL string, or fallback placeholder
    let finalImageUrl = image_url || null;
    if (req.file) {
      finalImageUrl = await imageStorageService.processUpload(req.file);
    }

    // Default wash threshold based on category if not explicitly provided
    const defaultThreshold = DEFAULT_THRESHOLDS[category] || 3;
    const finalThreshold = wash_threshold && parseInt(wash_threshold, 10) > 0 
      ? parseInt(wash_threshold, 10) 
      : defaultThreshold;

    const insertResult = await query(
      `INSERT INTO clothing (
        user_id, name, category, color, style, material, image_url,
        wash_threshold, current_wear_count, lifetime_wear_count, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, 0, NOW(), NOW())
      RETURNING *`,
      [
        userId,
        name.trim(),
        category.trim(),
        color ? color.trim() : null,
        style ? style.trim() : null,
        material ? material.trim() : null,
        finalImageUrl,
        finalThreshold,
      ]
    );

    const newItem = enrichClothingItem(insertResult.rows[0]);

    return res.status(201).json({
      success: true,
      message: 'Clothing added successfully!',
      data: newItem,
    });
  } catch (err) {
    console.error('createClothing error:', err);
    return res.status(500).json({
      success: false,
      message: 'Unable to add clothing. Please try again.',
    });
  }
}

/**
 * Update an existing clothing item
 */
export async function updateClothing(req, res) {
  try {
    const userId = req.user.userId;
    const clothingId = req.params.id;
    const { name, category, color, style, material, wash_threshold, image_url } = req.body;

    // Verify ownership
    const checkItem = await query(
      `SELECT * FROM clothing WHERE clothing_id = $1 AND user_id = $2`,
      [clothingId, userId]
    );

    if (checkItem.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Clothing item not found.' });
    }

    const existing = checkItem.rows[0];

    // Determine image
    let finalImageUrl = existing.image_url;
    if (req.file) {
      finalImageUrl = await imageStorageService.processUpload(req.file);
    } else if (image_url !== undefined && image_url !== null) {
      finalImageUrl = image_url;
    }

    const updatedThreshold = wash_threshold ? parseInt(wash_threshold, 10) : existing.wash_threshold;

    const updateResult = await query(
      `UPDATE clothing SET
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        color = COALESCE($3, color),
        style = COALESCE($4, style),
        material = COALESCE($5, material),
        image_url = $6,
        wash_threshold = $7,
        updated_at = NOW()
      WHERE clothing_id = $8 AND user_id = $9
      RETURNING *`,
      [
        name ? name.trim() : existing.name,
        category ? category.trim() : existing.category,
        color !== undefined ? color.trim() : existing.color,
        style !== undefined ? style.trim() : existing.style,
        material !== undefined ? material.trim() : existing.material,
        finalImageUrl,
        updatedThreshold,
        clothingId,
        userId,
      ]
    );

    const updatedItem = enrichClothingItem(updateResult.rows[0]);

    return res.status(200).json({
      success: true,
      message: 'Clothing updated successfully!',
      data: updatedItem,
    });
  } catch (err) {
    console.error('updateClothing error:', err);
    return res.status(500).json({
      success: false,
      message: 'Unable to update clothing. Please try again.',
    });
  }
}

/**
 * Delete a clothing item
 */
export async function deleteClothing(req, res) {
  try {
    const userId = req.user.userId;
    const clothingId = req.params.id;

    // Verify ownership
    const checkItem = await query(
      `SELECT * FROM clothing WHERE clothing_id = $1 AND user_id = $2`,
      [clothingId, userId]
    );

    if (checkItem.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Clothing item not found.' });
    }

    const existing = checkItem.rows[0];

    // Delete item (DB cascades delete to wear_history & wash_history)
    await query(`DELETE FROM clothing WHERE clothing_id = $1 AND user_id = $2`, [
      clothingId,
      userId,
    ]);

    // Cleanup local image if applicable
    if (existing.image_url) {
      await imageStorageService.deleteImage(existing.image_url);
    }

    return res.status(200).json({
      success: true,
      message: 'Clothing removed from your wardrobe.',
    });
  } catch (err) {
    console.error('deleteClothing error:', err);
    return res.status(500).json({
      success: false,
      message: 'Unable to delete clothing item.',
    });
  }
}

/**
 * Record a wear event ("I WORE THIS")
 * 1. Increase current wear count by 1
 * 2. Increase lifetime wear count by 1
 * 3. Update last worn date
 * 4. Add entry to wear history
 * 5. Recalculate status
 * 6. Return updated item
 */
export async function recordWear(req, res) {
  try {
    const userId = req.user.userId;
    const clothingId = req.params.id;

    // Check ownership
    const checkItem = await query(
      `SELECT * FROM clothing WHERE clothing_id = $1 AND user_id = $2`,
      [clothingId, userId]
    );

    if (checkItem.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Clothing item not found.' });
    }

    // Insert into wear history
    await query(
      `INSERT INTO wear_history (clothing_id, worn_date) VALUES ($1, NOW())`,
      [clothingId]
    );

    // Update clothing counters and last_worn
    const updateResult = await query(
      `UPDATE clothing SET
        current_wear_count = current_wear_count + 1,
        lifetime_wear_count = lifetime_wear_count + 1,
        last_worn = NOW(),
        updated_at = NOW()
      WHERE clothing_id = $1 AND user_id = $2
      RETURNING *`,
      [clothingId, userId]
    );

    const updatedItem = enrichClothingItem(updateResult.rows[0]);

    // Fetch refreshed wear history
    const historyResult = await query(
      `SELECT wear_id, worn_date FROM wear_history WHERE clothing_id = $1 ORDER BY worn_date DESC`,
      [clothingId]
    );

    return res.status(200).json({
      success: true,
      message: 'Wear count updated!',
      data: {
        ...updatedItem,
        wearHistory: historyResult.rows,
      },
    });
  } catch (err) {
    console.error('recordWear error:', err);
    return res.status(500).json({
      success: false,
      message: 'Unable to log wear event.',
    });
  }
}

/**
 * Record a wash event ("MARK AS WASHED")
 * 1. Reset current wear count to 0
 * 2. Keep lifetime wear count unchanged
 * 3. Update last washed date
 * 4. Add record to wash history
 * 5. Recalculate status (Clean)
 * 6. Return updated item
 */
export async function recordWash(req, res) {
  try {
    const userId = req.user.userId;
    const clothingId = req.params.id;

    // Check ownership
    const checkItem = await query(
      `SELECT * FROM clothing WHERE clothing_id = $1 AND user_id = $2`,
      [clothingId, userId]
    );

    if (checkItem.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Clothing item not found.' });
    }

    // Insert into wash history
    await query(
      `INSERT INTO wash_history (clothing_id, wash_date) VALUES ($1, NOW())`,
      [clothingId]
    );

    // Reset current_wear_count to 0, update last_washed
    const updateResult = await query(
      `UPDATE clothing SET
        current_wear_count = 0,
        last_washed = NOW(),
        updated_at = NOW()
      WHERE clothing_id = $1 AND user_id = $2
      RETURNING *`,
      [clothingId, userId]
    );

    const updatedItem = enrichClothingItem(updateResult.rows[0]);

    // Fetch refreshed wash history
    const historyResult = await query(
      `SELECT wash_id, wash_date FROM wash_history WHERE clothing_id = $1 ORDER BY wash_date DESC`,
      [clothingId]
    );

    return res.status(200).json({
      success: true,
      message: 'Marked as washed! Item is fresh and clean.',
      data: {
        ...updatedItem,
        washHistory: historyResult.rows,
      },
    });
  } catch (err) {
    console.error('recordWash error:', err);
    return res.status(500).json({
      success: false,
      message: 'Unable to record wash event.',
    });
  }
}

/**
 * Get Wear History for clothing item
 */
export async function getWearHistory(req, res) {
  try {
    const userId = req.user.userId;
    const clothingId = req.params.id;

    // Check ownership
    const checkItem = await query(
      `SELECT clothing_id FROM clothing WHERE clothing_id = $1 AND user_id = $2`,
      [clothingId, userId]
    );

    if (checkItem.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Clothing item not found.' });
    }

    const historyResult = await query(
      `SELECT wear_id, worn_date FROM wear_history WHERE clothing_id = $1 ORDER BY worn_date DESC`,
      [clothingId]
    );

    return res.status(200).json({
      success: true,
      data: historyResult.rows,
    });
  } catch (err) {
    console.error('getWearHistory error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve wear history.' });
  }
}

/**
 * Get Wash History for clothing item
 */
export async function getWashHistory(req, res) {
  try {
    const userId = req.user.userId;
    const clothingId = req.params.id;

    // Check ownership
    const checkItem = await query(
      `SELECT clothing_id FROM clothing WHERE clothing_id = $1 AND user_id = $2`,
      [clothingId, userId]
    );

    if (checkItem.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Clothing item not found.' });
    }

    const historyResult = await query(
      `SELECT wash_id, wash_date FROM wash_history WHERE clothing_id = $1 ORDER BY wash_date DESC`,
      [clothingId]
    );

    return res.status(200).json({
      success: true,
      data: historyResult.rows,
    });
  } catch (err) {
    console.error('getWashHistory error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve wash history.' });
  }
}
