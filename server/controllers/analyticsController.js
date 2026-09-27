import { query } from '../config/db.js';
import { enrichClothingItem, STATUS_TYPES, CATEGORIES } from '../utils/statusCalculator.js';

/**
 * Get comprehensive wardrobe analytics for authenticated user
 */
export async function getAnalyticsData(req, res) {
  try {
    const userId = req.user.userId;

    // Fetch user clothes
    const clothesResult = await query(
      `SELECT * FROM clothing WHERE user_id = $1`,
      [userId]
    );

    const clothes = clothesResult.rows.map(enrichClothingItem);
    const totalItems = clothes.length;

    // Total lifetime wears
    const totalLifetimeWears = clothes.reduce(
      (sum, item) => sum + (parseInt(item.lifetime_wear_count, 10) || 0),
      0
    );

    // Total washes count across all items owned by this user
    const washCountResult = await query(
      `SELECT COUNT(w.wash_id) as total_washes
       FROM wash_history w
       JOIN clothing c ON w.clothing_id = c.clothing_id
       WHERE c.user_id = $1`,
      [userId]
    );
    const totalWashes = parseInt(washCountResult.rows[0]?.total_washes || 0, 10);

    // Items requiring washing count
    const itemsRequiringWash = clothes.filter(
      (item) => item.status === STATUS_TYPES.WASH_REQUIRED
    ).length;

    // Category Distribution
    const categoryMap = {};
    CATEGORIES.forEach((cat) => {
      categoryMap[cat] = 0;
    });

    clothes.forEach((item) => {
      if (categoryMap[item.category] !== undefined) {
        categoryMap[item.category]++;
      } else {
        categoryMap[item.category] = 1;
      }
    });

    const categoryDistribution = Object.entries(categoryMap)
      .map(([category, count]) => ({
        category,
        count,
        percentage: totalItems > 0 ? Math.round((count / totalItems) * 100) : 0,
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);

    // Status Distribution
    const statusCounts = {
      [STATUS_TYPES.CLEAN]: 0,
      [STATUS_TYPES.WASH_SOON]: 0,
      [STATUS_TYPES.WASH_REQUIRED]: 0,
    };
    clothes.forEach((item) => {
      if (statusCounts[item.status] !== undefined) {
        statusCounts[item.status]++;
      }
    });

    // Most Worn Items (Top 5 by lifetime_wear_count)
    const mostWornItems = [...clothes]
      .sort((a, b) => b.lifetime_wear_count - a.lifetime_wear_count)
      .slice(0, 5);

    // Least Recently Worn (Oldest last_worn or never worn)
    const leastRecentlyWorn = [...clothes]
      .sort((a, b) => {
        if (!a.last_worn && !b.last_worn) return 0;
        if (!a.last_worn) return -1; // never worn comes first
        if (!b.last_worn) return 1;
        return new Date(a.last_worn) - new Date(b.last_worn);
      })
      .slice(0, 5);

    // Most Washed Items (query count of wash_history per clothing_id)
    const mostWashedResult = await query(
      `SELECT c.clothing_id, c.name, c.category, c.image_url, COUNT(w.wash_id) as wash_count
       FROM clothing c
       LEFT JOIN wash_history w ON c.clothing_id = w.clothing_id
       WHERE c.user_id = $1
       GROUP BY c.clothing_id, c.name, c.category, c.image_url
       ORDER BY wash_count DESC
       LIMIT 5`,
      [userId]
    );

    const mostWashedItems = mostWashedResult.rows.map((row) => ({
      ...row,
      wash_count: parseInt(row.wash_count, 10),
    }));

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalItems,
          totalLifetimeWears,
          totalWashes,
          itemsRequiringWash,
        },
        categoryDistribution,
        statusDistribution: [
          { status: 'Clean', count: statusCounts[STATUS_TYPES.CLEAN], color: '#10B981' },
          { status: 'Wash Soon', count: statusCounts[STATUS_TYPES.WASH_SOON], color: '#F59E0B' },
          { status: 'Wash Required', count: statusCounts[STATUS_TYPES.WASH_REQUIRED], color: '#EF4444' },
        ],
        mostWornItems,
        leastRecentlyWorn,
        mostWashedItems,
      },
    });
  } catch (err) {
    console.error('getAnalyticsData error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics data.',
    });
  }
}
