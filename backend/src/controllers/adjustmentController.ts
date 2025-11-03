import { Request, Response } from 'express';
import StockAdjustment from '../models/StockAdjustment';

// Get all stock adjustments
export const getStockAdjustments = async (req: Request, res: Response) => {
  try {
    const adjustments = await StockAdjustment.find();
    res.status(200).json(adjustments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stock adjustments', error });
  }
};

// Get stock adjustment by ID
export const getStockAdjustmentById = async (req: Request, res: Response) => {
  try {
    const adjustment = await StockAdjustment.findById(req.params.id);
    if (!adjustment) {
      return res.status(404).json({ message: 'Stock adjustment not found' });
    }
    res.status(200).json(adjustment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stock adjustment', error });
  }
};

// Create new stock adjustment
export const createStockAdjustment = async (req: Request, res: Response) => {
  try {
    const adjustment = new StockAdjustment(req.body);
    await adjustment.save();
    res.status(201).json(adjustment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating stock adjustment', error });
  }
};

// Update stock adjustment
export const updateStockAdjustment = async (req: Request, res: Response) => {
  try {
    const adjustment = await StockAdjustment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!adjustment) {
      return res.status(404).json({ message: 'Stock adjustment not found' });
    }
    res.status(200).json(adjustment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating stock adjustment', error });
  }
};

// Delete stock adjustment
export const deleteStockAdjustment = async (req: Request, res: Response) => {
  try {
    const adjustment = await StockAdjustment.findByIdAndDelete(req.params.id);
    if (!adjustment) {
      return res.status(404).json({ message: 'Stock adjustment not found' });
    }
    res.status(200).json({ message: 'Stock adjustment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting stock adjustment', error });
  }
};