import { Request, Response } from 'express';
import SupplyChainItem from '../models/SupplyChainItem';

export const getSupplyChainItems = async (req: Request, res: Response) => {
  try {
    const items = await SupplyChainItem.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching supply chain items', error });
  }
};

export const getSupplyChainItemById = async (req: Request, res: Response) => {
  try {
    const item = await SupplyChainItem.findOne({ id: req.params.id });
    if (!item) {
      return res.status(404).json({ message: 'Supply chain item not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching supply chain item', error });
  }
};

export const createSupplyChainItem = async (req: Request, res: Response) => {
  try {
    let nextId = 1;
    if (!req.body.id) {
      const lastItem = await SupplyChainItem.findOne().sort({ id: -1 }).exec();
      nextId = lastItem && typeof lastItem.id === 'number' ? lastItem.id + 1 : 1;
    } else {
      nextId = req.body.id;
    }
    
    const itemData = {
      ...req.body,
      id: nextId
    };
    
    const item = new SupplyChainItem(itemData);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    console.error('Create supply chain item error:', error);
    res.status(500).json({ message: 'Error creating supply chain item', error });
  }
};

export const updateSupplyChainItem = async (req: Request, res: Response) => {
  try {
    const item = await SupplyChainItem.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ message: 'Supply chain item not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error updating supply chain item', error });
  }
};

export const deleteSupplyChainItem = async (req: Request, res: Response) => {
  try {
    const item = await SupplyChainItem.findOneAndDelete({ id: req.params.id });
    if (!item) {
      return res.status(404).json({ message: 'Supply chain item not found' });
    }
    res.status(200).json({ message: 'Supply chain item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting supply chain item', error });
  }
};