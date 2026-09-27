import express from 'express';
import {
  getClothes,
  getClothingById,
  createClothing,
  updateClothing,
  deleteClothing,
  recordWear,
  recordWash,
  getWearHistory,
  getWashHistory,
} from '../controllers/clothingController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// All clothing routes require authentication
router.use(authenticate);

router.get('/', getClothes);
router.get('/:id', getClothingById);
router.post('/', upload.single('image'), createClothing);
router.put('/:id', upload.single('image'), updateClothing);
router.delete('/:id', deleteClothing);

// Wear and Wash tracking
router.post('/:id/wear', recordWear);
router.post('/:id/wash', recordWash);

// Histories
router.get('/:id/wear-history', getWearHistory);
router.get('/:id/wash-history', getWashHistory);

export default router;
