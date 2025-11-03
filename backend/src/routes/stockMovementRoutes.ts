import express from 'express';
import { StockMovement } from '../models/StockMovement';

const router = express.Router();

// GET /api/stock-movements
router.get('/', async (req, res) => {
  try {
    const movements = await StockMovement.find().sort({ createdAt: -1 });
    res.json({ data: movements });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock movements' });
  }
});

// POST /api/stock-movements
router.post('/', async (req, res) => {
  try {
    const movement = new StockMovement({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const saved = await movement.save();
    res.status(201).json({ data: saved });
  } catch (error) {
    console.error('Error creating stock movement:', error);
    res.status(500).json({ error: 'Failed to create stock movement' });
  }
});

export default router;