import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryVoucher extends Document {
  date: string;
  status: 'تمت الموافقة' | 'قيد المراجعة' | 'مرفوض';
  description: string;
  details: string;
  createdBy: string;
  branchId: string;
  type: 'up' | 'down';
  source: 'manual' | 'system';
  warehouseId?: string;
  customerId?: string;
  supplierId?: string;
  referenceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryVoucherSchema = new Schema({
  date: { type: String, required: true },
  status: { type: String, enum: ['تمت الموافقة', 'قيد المراجعة', 'مرفوض'], default: 'قيد المراجعة' },
  description: { type: String, required: true },
  details: { type: String, required: true },
  createdBy: { type: String, required: true },
  branchId: { type: String, required: true },
  type: { type: String, enum: ['up', 'down'], required: true },
  source: { type: String, enum: ['manual', 'system'], default: 'manual' },
  warehouseId: { type: String },
  customerId: { type: String },
  supplierId: { type: String },
  referenceId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const InventoryVoucher = mongoose.model<IInventoryVoucher>('InventoryVoucher', InventoryVoucherSchema);