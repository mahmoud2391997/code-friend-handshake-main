import { Request, Response } from 'express';
import SupplyMovement from '../models/SupplyMovement';

export const getSupplyMovements = async (req: Request, res: Response) => {
  try {
    const movements = await SupplyMovement.find().sort({ date: -1 });
    res.status(200).json(movements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching supply movements', error });
  }
};

export const getSupplyMovementById = async (req: Request, res: Response) => {
  try {
    const movement = await SupplyMovement.findOne({ 
      $or: [{ id: req.params.id }, { _id: req.params.id }] 
    });
    if (!movement) {
      return res.status(404).json({ message: 'Supply movement not found' });
    }
    res.status(200).json(movement);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching supply movement', error });
  }
};

export const createSupplyMovement = async (req: Request, res: Response) => {
  try {
    // Generate ID if not provided
    if (!req.body.id) {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const lastMovement = await SupplyMovement.findOne({ id: { $regex: `^SM-${today}` } }).sort({ id: -1 });
      const seq = lastMovement ? parseInt(lastMovement.id.split('-')[2]) + 1 : 1;
      req.body.id = `SM-${today}-${seq.toString().padStart(4, '0')}`;
    }

    // Set date if not provided
    if (!req.body.date) {
      req.body.date = new Date().toISOString();
    }

    const movement = new SupplyMovement(req.body);
    await movement.save();
    res.status(201).json(movement);
  } catch (error) {
    console.error('Create supply movement error:', error);
    res.status(500).json({ message: 'Error creating supply movement', error });
  }
};

export const updateSupplyMovement = async (req: Request, res: Response) => {
  try {
    const movement = await SupplyMovement.findOneAndUpdate(
      { $or: [{ id: req.params.id }, { _id: req.params.id }] },
      req.body,
      { new: true }
    );
    if (!movement) {
      return res.status(404).json({ message: 'Supply movement not found' });
    }
    res.status(200).json(movement);
  } catch (error) {
    res.status(500).json({ message: 'Error updating supply movement', error });
  }
};

export const deleteSupplyMovement = async (req: Request, res: Response) => {
  try {
    const movement = await SupplyMovement.findOneAndDelete({ 
      $or: [{ id: req.params.id }, { _id: req.params.id }] 
    });
    if (!movement) {
      return res.status(404).json({ message: 'Supply movement not found' });
    }
    res.status(200).json({ message: 'Supply movement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting supply movement', error });
  }
};