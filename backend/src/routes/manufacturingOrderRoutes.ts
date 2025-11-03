import express from 'express';
import {
  getManufacturingOrders,
  getManufacturingOrderById,
  createManufacturingOrder,
  updateManufacturingOrder,
  deleteManufacturingOrder
} from '../controllers/manufacturingOrderController';

const router = express.Router();

router.get('/', getManufacturingOrders);
router.get('/:id', getManufacturingOrderById);
router.post('/', createManufacturingOrder);
router.put('/:id', updateManufacturingOrder);
router.delete('/:id', deleteManufacturingOrder);

export default router;