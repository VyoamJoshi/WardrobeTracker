import { query } from '../config/db.js';
import { enrichClothingItem, STATUS_TYPES } from '../utils/statusCalculator.js';

/**
 * Get aggregated Dashboard data for authenticated user
 */
export async function getDashboardData(req, res) {
  try {
    const userId = req.user.userId;

    // Fetch all user clothing items to accurately compute real-time status and lists
    const clothesResult = await query(
      `SELECT * FROM clothing WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    const allItems = clothesResult.rows.map(enrichClothingItem);

    const totalItems = allItems.length;
    let cleanCount = 0;
    let washSoonCount = 0;
    let washRequiredCount = 0;

    const laundryReminders = [];

    allItems.forEach((item) => {
      if (item.status === STATUS_TYPES.CLEAN) {
        cleanCount++;
      } else if (item.status === STATUS_TYPES.WASH_SOON) {
        washSoonCount++;
        laundryReminders.push(item);
      } else if (item.status === STATUS_TYPES.WASH_REQUIRED) {
        washRequiredCount++;
        // Priority reminders first
        laundryReminders.unshift(item);
      }
    });

    // Recently worn (items with last_worn NOT NULL, ordered by last_worn DESC, limit 6)
    const recentlyWorn = allItems
      .filter((item) => item.last_worn !== null)
      .sort((a, b) => new Date(b.last_worn) - new Date(a.last_worn))
      .slice(0, 6);

    // Recently washed (items with last_washed NOT NULL, ordered by last_washed DESC, limit 6)
    const recentlyWashed = allItems
      .filter((item) => item.last_washed !== null)
      .sort((a, b) => new Date(b.last_washed) - new Date(a.last_washed))
      .slice(0, 6);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalItems,
          cleanCount,
          washSoonCount,
          washRequiredCount,
        },
        laundryReminders: laundryReminders.slice(0, 10),
        recentlyWorn,
        recentlyWashed,
      },
    });
  } catch (err) {
    console.error('getDashboardData error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard data.',
    });
  }
}
