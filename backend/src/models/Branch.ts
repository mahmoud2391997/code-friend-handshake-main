import mongoose, { Schema, Document } from 'mongoose';

export interface IBranch extends Document {
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  manager?: string;
  status?: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String },
  address: { type: String },
  phone: { type: String },
  manager: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Branch = mongoose.model<IBranch>('Branch', BranchSchema);