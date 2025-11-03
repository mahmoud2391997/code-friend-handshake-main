import { Request, Response } from 'express';
import { Branch } from '../models/Branch';

export const getBranches = async (req: Request, res: Response) => {
  try {
    const branches = await Branch.find().sort({ createdAt: -1 });
    res.json({ data: branches });
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
};

export const getBranchById = async (req: Request, res: Response) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    res.json({ data: branch });
  } catch (error) {
    console.error('Error fetching branch:', error);
    res.status(500).json({ error: 'Failed to fetch branch' });
  }
};

export const createBranch = async (req: Request, res: Response) => {
  try {
    const branch = new Branch({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const saved = await branch.save();
    res.status(201).json({ data: saved });
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({ error: 'Failed to create branch' });
  }
};

export const updateBranch = async (req: Request, res: Response) => {
  try {
    const updated = await Branch.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    res.json({ data: updated });
  } catch (error) {
    console.error('Error updating branch:', error);
    res.status(500).json({ error: 'Failed to update branch' });
  }
};

export const deleteBranch = async (req: Request, res: Response) => {
  try {
    const deleted = await Branch.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    res.json({ message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('Error deleting branch:', error);
    res.status(500).json({ error: 'Failed to delete branch' });
  }
};