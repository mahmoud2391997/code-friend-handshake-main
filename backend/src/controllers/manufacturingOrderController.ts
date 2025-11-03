import { Request, Response } from 'express';
import ManufacturingOrder from '../models/ManufacturingOrder';

export const getManufacturingOrders = async (req: Request, res: Response) => {
  try {
    const orders = await ManufacturingOrder.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching manufacturing orders', error });
  }
};

export const getManufacturingOrderById = async (req: Request, res: Response) => {
  try {
    const order = await ManufacturingOrder.findOne({ id: req.params.id });
    if (!order) {
      return res.status(404).json({ message: 'Manufacturing order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching manufacturing order', error });
  }
};

export const createManufacturingOrder = async (req: Request, res: Response) => {
  try {
    // Generate ID if not provided
    if (!req.body.id) {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const lastOrder = await ManufacturingOrder.findOne({ id: { $regex: `^MO-${today}` } }).sort({ id: -1 });
      const seq = lastOrder ? parseInt(lastOrder.id.split('-')[2]) + 1 : 1;
      req.body.id = `MO-${today}-${seq.toString().padStart(3, '0')}`;
    }

    // Generate batch code if not provided
    if (!req.body.batchCode) {
      req.body.batchCode = `BATCH-${Date.now()}`;
    }

    const order = new ManufacturingOrder(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error('Create manufacturing order error:', error);
    res.status(500).json({ message: 'Error creating manufacturing order', error });
  }
};

export const updateManufacturingOrder = async (req: Request, res: Response) => {
  try {
    const order = await ManufacturingOrder.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Manufacturing order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating manufacturing order', error });
  }
};

export const deleteManufacturingOrder = async (req: Request, res: Response) => {
  try {
    const order = await ManufacturingOrder.findOneAndDelete({ id: req.params.id });
    if (!order) {
      return res.status(404).json({ message: 'Manufacturing order not found' });
    }
    res.status(200).json({ message: 'Manufacturing order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting manufacturing order', error });
  }
};