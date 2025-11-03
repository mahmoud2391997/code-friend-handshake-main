import { Request, Response } from 'express';
import InventoryItem from '../models/InventoryItem';

// Get all inventory items
export const getInventoryItems = async (req: Request, res: Response) => {
  try {
    const items = await InventoryItem.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory items', error });
  }
};

// Get inventory item by ID
export const getInventoryItemById = async (req: Request, res: Response) => {
  try {
    const item = await InventoryItem.findOne({ id: req.params.id });
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory item', error });
  }
};

// Create new inventory item
export const createInventoryItem = async (req: Request, res: Response) => {
  try {
    // Auto-generate ID if not provided
    let nextId = 1;
    if (!req.body.id) {
      const lastItem = await InventoryItem.findOne().sort({ id: -1 }).exec();
      nextId = lastItem && typeof lastItem.id === 'number' ? lastItem.id + 1 : 1;
    } else {
      nextId = req.body.id;
    }
    
    // Set default values for required fields
    const itemData = {
      ...req.body,
      id: nextId,
      type: req.body.category || req.body.type || 'general',
      currentStock: req.body.currentStock || req.body.quantity || 0,
      locked: req.body.locked || false,
      branchId: req.body.branchId || `branch_${nextId}`,
      productId: req.body.productId || `product_${nextId}`
    };
    
    const item = new InventoryItem(itemData);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    console.error('Create inventory item error:', error);
    res.status(500).json({ message: 'Error creating inventory item', error });
  }
};

// Update inventory item
export const updateInventoryItem = async (req: Request, res: Response) => {
  try {
    const item = await InventoryItem.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error updating inventory item', error });
  }
};

// Delete inventory item
export const deleteInventoryItem = async (req: Request, res: Response) => {
  try {
    const item = await InventoryItem.findOneAndDelete({ id: req.params.id });
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.status(200).json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting inventory item', error });
  }
};

// Seed inventory data
export const seedInventoryData = async (req: Request, res: Response) => {
  try {
    const mockInventory = [
      {
        id: 1,
        name: 'عطر الورد الطائفي',
        type: 'Product',
        currentStock: 50,
        minimumStock: 10,
        unit: 'pcs',
        costPerUnit: 20.000,
        locked: false,
        branchId: 1
      },
      {
        id: 2,
        name: 'عطر العود الكمبودي',
        type: 'Product',
        currentStock: 30,
        minimumStock: 5,
        unit: 'pcs',
        costPerUnit: 40.000,
        locked: false,
        branchId: 1
      },
      {
        id: 3,
        name: 'مسك الطهارة',
        type: 'Product',
        currentStock: 75,
        minimumStock: 15,
        unit: 'pcs',
        costPerUnit: 12.000,
        locked: false,
        branchId: 1
      },
      {
        id: 4,
        name: 'بخور العود',
        type: 'Product',
        currentStock: 25,
        minimumStock: 8,
        unit: 'pcs',
        costPerUnit: 30.000,
        locked: false,
        branchId: 1
      },
      {
        id: 5,
        name: 'زيت الورد',
        type: 'Product',
        currentStock: 500.000,
        minimumStock: 100.000,
        unit: 'ml',
        costPerUnit: 0.010,
        locked: false,
        branchId: 1
      }
    ];

    // Clear existing data
    await InventoryItem.deleteMany({});
    
    // Insert mock data
    const items = await InventoryItem.insertMany(mockInventory);
    
    res.status(200).json({ 
      message: 'Inventory data seeded successfully', 
      count: items.length,
      items 
    });
  } catch (error) {
    console.error('Seed inventory error:', error);
    res.status(500).json({ message: 'Error seeding inventory data', error });
  }
};