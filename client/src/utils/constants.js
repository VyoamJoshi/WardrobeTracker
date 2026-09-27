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
  'Shoes': 15,
};

export const STATUS_OPTIONS = [
  { id: 'All', label: 'All Statuses' },
  { id: 'Clean', label: 'Clean', dot: 'bg-emerald-500' },
  { id: 'Wash Soon', label: 'Wash Soon', dot: 'bg-amber-500' },
  { id: 'Wash Required', label: 'Wash Required', dot: 'bg-rose-500' },
];

export const SORT_OPTIONS = [
  { id: 'recently_added', label: 'Recently Added' },
  { id: 'recently_worn', label: 'Recently Worn' },
  { id: 'least_recently_worn', label: 'Least Recently Worn' },
  { id: 'most_worn', label: 'Most Worn' },
  { id: 'category', label: 'Category' },
  { id: 'name', label: 'Name (A-Z)' },
];
