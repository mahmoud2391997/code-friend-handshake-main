import express from 'express';
import { InventoryRequisition } from '../models/InventoryRequisition';

const router = express.Router();

// GET /api/requisitions
router.get('/', async (req, res) => {
  try {
    const requisitions = await InventoryRequisition.find().sort({ createdAt: -1 });
    res.json({ data: requisitions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requisitions' });
  }
});

// POST /api/requisitions
router.post('/', async (req, res) => {
  try {
    const requisition = new InventoryRequisition({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const saved = await requisition.save();
    res.status(201).json({ data: saved });
  } catch (error) {
    console.error('Error creating requisition:', error);
    res.status(500).json({ error: 'Failed to create requisition' });
  }
});

// PUT /api/requisitions/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await InventoryRequisition.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Requisition not found' });
    res.json({ data: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update requisition' });
  }
});

// DELETE /api/requisitions/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await InventoryRequisition.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Requisition not found' });
    res.json({ message: 'Requisition deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete requisition' });
  }
});

export default router;