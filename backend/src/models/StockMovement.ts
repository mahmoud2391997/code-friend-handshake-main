import mongoose, { Schema, Document } from 'mongoose';

export interface IStockMovement extends Document {
  productId: string;
  branchId: string;
  movementType: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  referenceType: 'MANUAL' | 'PURCHASE' | 'SALE' | 'TRANSFER' | 'ADJUSTMENT';
  referenceId?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const StockMovementSchema = new Schema({
  productId: { type: String, required: true },
  branchId: { type: String, required: true },
  movementType: { type: String, enum: ['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'], required: true },
  quantity: { type: Number, required: true },
  referenceType: { type: String, enum: ['MANUAL', 'PURCHASE', 'SALE', 'TRANSFER', 'ADJUSTMENT'], required: true },
  referenceId: { type: String },
  notes: { type: String },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const StockMovement = mongoose.model<IStockMovement>('StockMovement', StockMovementSchema);