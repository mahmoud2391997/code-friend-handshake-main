import mongoose from 'mongoose';
import InventoryItem from './models/InventoryItem';

const mockInventory = [
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

export async function seedInventoryData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erp_system');
    console.log('Connected to MongoDB for seeding');

    // Clear existing inventory data
    await InventoryItem.deleteMany({});
    console.log('Cleared existing inventory data');

    // Insert mock data
    await InventoryItem.insertMany(mockInventory);
    console.log('Seeded inventory data successfully');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  seedInventoryData();
}