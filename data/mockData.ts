import { Product, Customer, Branch, InventoryItem } from '../types';

export const mockProducts: Product[] = [
  {
    id: 1,
    name: 'عطر الورد الطائفي',
    sku: 'ROSE-001',
    category: 'عطور',
    unitPrice: 25.500,
    baseUnit: 'pcs'
  },
  {
    id: 2,
    name: 'عطر العود الكمبودي',
    sku: 'OUD-001',
    category: 'عطور',
    unitPrice: 45.750,
    baseUnit: 'pcs'
  },
  {
    id: 3,
    name: 'مسك الطهارة',
    sku: 'MUSK-001',
    category: 'مسك',
    unitPrice: 15.250,
    baseUnit: 'pcs'
  },
  {
    id: 4,
    name: 'بخور العود',
    sku: 'INCENSE-001',
    category: 'بخور',
    unitPrice: 35.000,
    baseUnit: 'pcs'
  },
  {
    id: 5,
    name: 'زيت الورد',
    sku: 'OIL-ROSE-001',
    category: 'زيوت',
    unitPrice: 12.500,
    baseUnit: 'ml'
  }
];

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    phone: '99887766',
    address: 'الكويت',
    balance: 0,
    addedBy: 'system'
  },
  {
    id: '2',
    name: 'فاطمة علي',
    email: 'fatima@example.com',
    phone: '99776655',
    address: 'حولي',
    balance: 0,
    addedBy: 'system'
  },
  {
    id: '3',
    name: 'محمد الأحمد',
    email: 'mohammed@example.com',
    phone: '99665544',
    address: 'الجهراء',
    balance: 0,
    addedBy: 'system'
  },
  {
    id: '4',
    name: 'زبون نقدي عام',
    email: '',
    phone: '',
    address: '',
    balance: 0,
    addedBy: 'system'
  }
];

export const mockBranches: Branch[] = [
  {
    id: '1',
    name: 'الفرع الرئيسي',
    code: 'MAIN',
    address: { street: 'شارع الملك فهد', city: 'الكويت' },
    status: 'active'
  },
  {
    id: '2',
    name: 'فرع حولي',
    code: 'HAWALLI',
    address: { street: 'شارع تونس', city: 'حولي' },
    status: 'active'
  }
];

export const mockInventory: InventoryItem[] = [
  {
    id: 1,
    name: 'عطر الورد الطائفي',
    type: 'Product',
    currentStock: 50,
    minimumStock: 10,
    unit: 'pcs',
    costPerUnit: 20.000,
    locked: false,
    branchId: 1
  },
  {
    id: 2,
    name: 'عطر العود الكمبودي',
    type: 'Product',
    currentStock: 30,
    minimumStock: 5,
    unit: 'pcs',
    costPerUnit: 40.000,
    locked: false,
    branchId: 1
  },
  {
    id: 3,
    name: 'مسك الطهارة',
    type: 'Product',
    currentStock: 75,
    minimumStock: 15,
    unit: 'pcs',
    costPerUnit: 12.000,
    locked: false,
    branchId: 1
  },
  {
    id: 4,
    name: 'بخور العود',
    type: 'Product',
    currentStock: 25,
    minimumStock: 8,
    unit: 'pcs',
    costPerUnit: 30.000,
    locked: false,
    branchId: 1
  },
  {
    id: 5,
    name: 'زيت الورد',
    type: 'Product',
    currentStock: 500.000,
    minimumStock: 100.000,
    unit: 'ml',
    costPerUnit: 0.010,
    locked: false,
    branchId: 1
  }
];