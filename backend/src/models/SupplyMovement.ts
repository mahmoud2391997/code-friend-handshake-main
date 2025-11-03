import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplyMovement extends Document {
  supplyId: string;
  branchId: string;
  type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  date: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupplyMovementSchema = new Schema({
  supplyId: { type: String, required: true },
  branchId: { type: String, required: true },
  type: { type: String, enum: ['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'], required: true },
  quantity: { type: Number, required: true },
  date: { type: String, required: true },
  notes: { type: String },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const SupplyMovement = mongoose.model<ISupplyMovement>('SupplyMovement', SupplyMovementSchema);