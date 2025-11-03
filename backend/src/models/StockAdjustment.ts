import { Schema, model, Document } from 'mongoose';

export interface IStockAdjustment extends Document {
  id: number;
  quantity: number;
  notes: string;
  reference_type: string;
}

const StockAdjustmentSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  quantity: { type: Number, required: true },
  notes: { type: String, required: true },
  reference_type: { type: String, required: true }
}, {
  timestamps: true
});

export default model<IStockAdjustment>('StockAdjustment', StockAdjustmentSchema);