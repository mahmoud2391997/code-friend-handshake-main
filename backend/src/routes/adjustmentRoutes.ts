import express from 'express';
import {
  getStockAdjustments,
  getStockAdjustmentById,
  createStockAdjustment,
  updateStockAdjustment,
  deleteStockAdjustment
} from '../controllers/adjustmentController';

const router = express.Router();

router.get('/', getStockAdjustments);
router.get('/:id', getStockAdjustmentById);
router.post('/', createStockAdjustment);
router.put('/:id', updateStockAdjustment);
router.delete('/:id', deleteStockAdjustment);

export default router;