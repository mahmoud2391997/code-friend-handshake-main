import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryRequisitionItem {
  productId: string;
  quantity: number;
}

export interface IInventoryRequisition extends Document {
  date: string;
  type: 'Purchase' | 'Transfer';
  branchId: string;
  branchName?: string;
  items: IInventoryRequisitionItem[];
  notes?: string;
  attachments?: string[];
  status?: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}

const InventoryRequisitionItemSchema = new Schema({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 }
});

const InventoryRequisitionSchema = new Schema({
  date: { type: String, required: true },
  type: { type: String, enum: ['Purchase', 'Transfer'], required: true },
  branchId: { type: String, required: true },
  branchName: { type: String },
  items: [InventoryRequisitionItemSchema],
  notes: { type: String },
  attachments: [{ type: String }],
  status: { type: String, enum: ['Draft', 'Pending', 'Approved', 'Rejected'], default: 'Draft' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const InventoryRequisition = mongoose.model<IInventoryRequisition>('InventoryRequisitions', InventoryRequisitionSchema);