import express from 'express';
import { SupplyChainItem } from '../models/SupplyChainItem';

const router = express.Router();

// GET /api/supply-chain
router.get('/', async (req, res) => {
  try {
    const items = await SupplyChainItem.find().sort({ createdAt: -1 });
    res.json({ data: items });
  } catch (error) {
    console.error('Error fetching supply chain items:', error);
    res.status(500).json({ error: 'Failed to fetch supply chain items' });
  }
});

// POST /api/supply-chain
router.post('/', async (req, res) => {
  try {
    const item = new SupplyChainItem({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const saved = await item.save();
    res.status(201).json({ data: saved });
  } catch (error) {
    console.error('Error creating supply chain item:', error);
    res.status(500).json({ error: 'Failed to create supply chain item' });
  }
});

export default router;