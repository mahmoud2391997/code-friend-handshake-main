export interface SupplyChainItem {
  id: number;
  _id: string;
  sku: string;
  gtin: string;
  batchNumber: string;
  serialNumber: string;
  productName: string;
  quantity: number;
  unit: string;
  manufacturer: string;
  originCountry: string;
  manufactureDate: string;
  expiryDate: string;
  currentStatus: SupplyChainStatus;
  transportMode: SupplyChainTransportMode;
}

export enum SupplyChainStatus {
  InTransit = 'IN_TRANSIT',
  Delivered = 'DELIVERED',
  Stored = 'STORED',
  Expired = 'EXPIRED',
}

export enum SupplyChainTransportMode {
  Air = 'AIR',
  Sea = 'SEA',
  Road = 'ROAD',
  Rail = 'RAIL',
}

// In types.ts
export interface SupplyMovement {
  _id: string;
  productId: string; // Consistently use productId for the item being moved
  branchId: string;
  movementType: 'IN' | 'OUT' | 'Transfer';
  quantity: number;
  date: string;
  notes?: string;
  createdBy: string;
}


export interface Supply {
  id: number;
  _id: string;
  name: string;
  // Add any other properties that a supply might have
}

export interface Branch {
  id: number;
  _id: string;
  name: string;
  // Add any other properties that a branch might have
}

export type Permission = string;

export enum Role {
  SuperAdmin = 'SuperAdmin',
  Admin = 'Admin',
  User = 'User',
}
