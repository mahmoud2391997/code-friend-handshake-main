import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  sku?: string;
  category?: string;
  unitPrice?: number;
  baseUnit?: string;
  description?: string;
  status?: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema({
  name: { type: String, required: true },
  sku: { type: String },
  category: { type: String },
  unitPrice: { type: Number, default: 0 },
  baseUnit: { type: String, default: 'pcs' },
  description: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);