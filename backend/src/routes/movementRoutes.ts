import express from 'express';
import {
  getStockMovements,
  getStockMovementById,
  createStockMovement,
  updateStockMovement,
  deleteStockMovement
} from '../controllers/movementController';

const router = express.Router();

router.get('/', getStockMovements);
router.get('/:id', getStockMovementById);
router.post('/', createStockMovement);
router.put('/:id', updateStockMovement);
router.delete('/:id', deleteStockMovement);

export default router;