import { Request, Response } from 'express';
import { StockMovement } from '../models/StockMovement';

// Get all stock movements
export const getStockMovements = async (req: Request, res: Response) => {
  try {
    const movements = await StockMovement.find();
    res.status(200).json(movements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stock movements', error });
  }
};

// Get stock movement by ID
export const getStockMovementById = async (req: Request, res: Response) => {
  try {
    const movement = await StockMovement.findOne({ id: req.params.id });
    if (!movement) {
      return res.status(404).json({ message: 'Stock movement not found' });
    }
    res.status(200).json(movement);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stock movement', error });
  }
};

// Create new stock movement
export const createStockMovement = async (req: Request, res: Response) => {
  try {
    const movement = new StockMovement(req.body);
    await movement.save();
    res.status(201).json(movement);
  } catch (error) {
    res.status(500).json({ message: 'Error creating stock movement', error });
  }
};

// Update stock movement
export const updateStockMovement = async (req: Request, res: Response) => {
  try {
    const movement = await StockMovement.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!movement) {
      return res.status(404).json({ message: 'Stock movement not found' });
    }
    res.status(200).json(movement);
  } catch (error) {
    res.status(500).json({ message: 'Error updating stock movement', error });
  }
};

// Delete stock movement
export const deleteStockMovement = async (req: Request, res: Response) => {
  try {
    const movement = await StockMovement.findOneAndDelete({ id: req.params.id });
    if (!movement) {
      return res.status(404).json({ message: 'Stock movement not found' });
    }
    res.status(200).json({ message: 'Stock movement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting stock movement', error });
  }
};