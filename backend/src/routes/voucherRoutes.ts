import express from 'express';
import { InventoryVoucher } from '../models/InventoryVoucher';

const router = express.Router();

// GET /api/vouchers
router.get('/', async (req, res) => {
  try {
    const vouchers = await InventoryVoucher.find().sort({ createdAt: -1 });
    res.json({ data: vouchers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vouchers' });
  }
});

// POST /api/vouchers
router.post('/', async (req, res) => {
  try {
    console.log('Creating voucher with data:', req.body);
    const voucher = new InventoryVoucher({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const saved = await voucher.save();
    console.log('Voucher saved:', saved);
    res.status(201).json({ data: saved });
  } catch (error) {
    console.error('Error creating voucher:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to create voucher', details: message });
  }
});

// PUT /api/vouchers/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await InventoryVoucher.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Voucher not found' });
    res.json({ data: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update voucher' });
  }
});

// DELETE /api/vouchers/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await InventoryVoucher.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Voucher not found' });
    res.json({ message: 'Voucher deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete voucher' });
  }
});

export default router;