import express from 'express';
import { SupplyMovement } from '../models/SupplyMovement';

const router = express.Router();

// GET /api/supply-movements
router.get('/', async (req, res) => {
  try {
    const movements = await SupplyMovement.find().sort({ createdAt: -1 });
    res.json({ data: movements });
  } catch (error) {
    console.error('Error fetching supply movements:', error);
    res.status(500).json({ error: 'Failed to fetch supply movements' });
  }
});

// POST /api/supply-movements
router.post('/', async (req, res) => {
  try {
    const movement = new SupplyMovement({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const saved = await movement.save();
    res.status(201).json({ data: saved });
  } catch (error) {
    console.error('Error creating supply movement:', error);
    res.status(500).json({ error: 'Failed to create supply movement' });
  }
});

export default router;