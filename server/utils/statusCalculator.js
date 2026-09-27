/**
 * Centralized Wash Status Calculation & Category Threshold Definitions
 * Section 11 & 12 of specifications
 */

export const CATEGORIES = [
  'T-Shirts',
  'Shirts',
  'Jeans',
  'Cargos',
  'Chinos',
  'Hoodies',
  'Sweatshirts',
  'Jackets',
  'Shoes',
];

export const DEFAULT_THRESHOLDS = {
  'T-Shirts': 2,
  'Shirts': 2,
  'Jeans': 4,
  'Cargos': 4,
  'Chinos': 3,
  'Hoodies': 4,
  'Sweatshirts': 4,
  'Jackets': 7,
  'Shoes': 15, // Usage/maintenance threshold
};

export const STATUS_TYPES = {
  CLEAN: 'Clean',
  WASH_SOON: 'Wash Soon',
  WASH_REQUIRED: 'Wash Required',
};

/**
 * Calculates wash status based on current wear count and wash threshold
 * @param {number} currentWearCount 
 * @param {number} washThreshold 
 * @returns {string} 'Clean' | 'Wash Soon' | 'Wash Required'
 */
export function calculateWashStatus(currentWearCount, washThreshold) {
  const current = Number(currentWearCount) || 0;
  const threshold = Number(washThreshold) || 1;

  if (current >= threshold) {
    return STATUS_TYPES.WASH_REQUIRED;
  }

  if (current >= threshold * 0.75) {
    return STATUS_TYPES.WASH_SOON;
  }

  return STATUS_TYPES.CLEAN;
}

/**
 * Returns formatted status object with badge color, icon, and label
 * @param {number} currentWearCount 
 * @param {number} washThreshold 
 */
export function getStatusDetails(currentWearCount, washThreshold) {
  const status = calculateWashStatus(currentWearCount, washThreshold);

  switch (status) {
    case STATUS_TYPES.WASH_REQUIRED:
      return {
        status: STATUS_TYPES.WASH_REQUIRED,
        badgeColor: 'red',
        icon: '🔴',
        label: 'Wash Required',
      };
    case STATUS_TYPES.WASH_SOON:
      return {
        status: STATUS_TYPES.WASH_SOON,
        badgeColor: 'amber',
        icon: '🟡',
        label: 'Wash Soon',
      };
    case STATUS_TYPES.CLEAN:
    default:
      return {
        status: STATUS_TYPES.CLEAN,
        badgeColor: 'green',
        icon: '🟢',
        label: 'Clean',
      };
  }
}

/**
 * Enriches clothing item with dynamic status fields
 */
export function enrichClothingItem(item) {
  if (!item) return null;
  const statusInfo = getStatusDetails(item.current_wear_count, item.wash_threshold);
  return {
    ...item,
    status: statusInfo.status,
    statusBadgeColor: statusInfo.badgeColor,
    statusIcon: statusInfo.icon,
    statusLabel: statusInfo.label,
  };
}
