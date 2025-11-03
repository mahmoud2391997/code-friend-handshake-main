import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplyChainItem extends Document {
  productName: string;
  sku?: string;
  quantity: number;
  unit: string;
  manufacturer?: string;
  batchNumber?: string;
  expiryDate?: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupplyChainItemSchema = new Schema({
  productName: { type: String, required: true },
  sku: { type: String },
  quantity: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true, default: 'pcs' },
  manufacturer: { type: String },
  batchNumber: { type: String },
  expiryDate: { type: String },
  status: { type: String, default: 'Active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const SupplyChainItem = mongoose.model<ISupplyChainItem>('SupplyChainItem', SupplyChainItemSchema);