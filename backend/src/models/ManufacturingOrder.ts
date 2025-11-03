import { Schema, model, Document } from 'mongoose';

export interface IManufacturingOrder extends Document {
  id: string;
  productName: string;
  manufacturingType: 'INTERNAL' | 'CONTRACT';
  responsibleEmployeeId?: string;
  concentration: 'EDT_15' | 'EDP_20' | 'EXTRAIT_30' | 'OIL_100';
  bottleSizeMl: number;
  unitsRequested: number;
  batchCode: string;
  branchId: number;
  manufacturingDate?: string;
  expiryDate?: string;
  dueAt?: string;
  formula: any[];
  processLoss: any;
  macerationDays: number;
  chilling?: any;
  filtration?: any;
  qc?: any;
  packagingItems: any[];
  costs: any;
  yield: any;
  distribution?: any[];
  status: 'DRAFT' | 'IN_PROGRESS' | 'MACERATING' | 'QC' | 'PACKAGING' | 'DONE' | 'CLOSED';
}

const ManufacturingOrderSchema = new Schema({
  id: { type: String, required: true, unique: true },
  productName: { type: String, required: true },
  manufacturingType: { type: String, enum: ['INTERNAL', 'CONTRACT'], required: true },
  responsibleEmployeeId: { type: String },
  concentration: { type: String, enum: ['EDT_15', 'EDP_20', 'EXTRAIT_30', 'OIL_100'], required: true },
  bottleSizeMl: { type: Number, required: true },
  unitsRequested: { type: Number, required: true },
  batchCode: { type: String, required: true },
  branchId: { type: Number, required: true },
  manufacturingDate: { type: String },
  expiryDate: { type: String },
  dueAt: { type: String },
  formula: [{ type: Schema.Types.Mixed }],
  processLoss: { type: Schema.Types.Mixed },
  macerationDays: { type: Number, default: 0 },
  chilling: { type: Schema.Types.Mixed },
  filtration: { type: Schema.Types.Mixed },
  qc: { type: Schema.Types.Mixed },
  packagingItems: [{ type: Schema.Types.Mixed }],
  costs: { type: Schema.Types.Mixed },
  yield: { type: Schema.Types.Mixed },
  distribution: [{ type: Schema.Types.Mixed }],
  status: { 
    type: String, 
    enum: ['DRAFT', 'IN_PROGRESS', 'MACERATING', 'QC', 'PACKAGING', 'DONE', 'CLOSED'],
    default: 'DRAFT'
  }
}, {
  timestamps: true
});

export default model<IManufacturingOrder>('ManufacturingOrder', ManufacturingOrderSchema);