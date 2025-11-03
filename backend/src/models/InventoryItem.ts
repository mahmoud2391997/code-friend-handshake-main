import { Schema, model, Document } from 'mongoose';

export interface IInventoryItem extends Document {
  id: number;
  name: string;
  type: string;
  currentStock: number;
  minimumStock: number;
  unit: string;
  costPerUnit: number;
  location?: string;
  barcode?: string;
  sku?: string;
  locked: boolean;
}

const InventoryItemSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, default: 'general' },
  currentStock: { type: Number, default: 0 },
  minimumStock: { type: Number, default: 0 },
  unit: { type: String, required: true },
  costPerUnit: { type: Number, default: 0 },
  location: { type: String },
  barcode: { type: String },
  sku: { type: String },
  locked: { type: Boolean, default: false },
  category: { type: String },
  description: { type: String },
  branchId: { type: String },
  productId: { type: String }
}, {
  timestamps: true
});

export default model<IInventoryItem>('InventoryItem', InventoryItemSchema);