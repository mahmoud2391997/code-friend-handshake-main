
import { configureStore } from '@reduxjs/toolkit';
import branchInventoryReducer from './slices/branchInventorySlice';
import branchReducer from './slices/branchSlice';
import customersReducer from './slices/customersSlice';
import importReducer from './slices/importSlice';
import inventoryReducer from './slices/inventorySlice';
import movementsReducer from './slices/movementsSlice';
import posProductsReducer from './slices/posProductsSlice';
import productsReducer from './slices/productsSlice';
import requisitionsReducer from './slices/requisitionsSlice';
import suppliesReducer from './slices/suppliesSlice';
import supplyInventoryReducer from './slices/supplyInventorySlice';
import supplyMovementsReducer from './slices/supplyMovementsSlice';
import supplyChainItemsReducer from './slices/supplyChainItemsSlice';
import supplyChainReducer from './slices/supplyChainSlice';
import manufacturingOrdersReducer from './slices/manufacturingOrdersSlice';
import vouchersReducer from './slices/vouchersSlice';
import stockMovementsReducer from './slices/stockMovementsSlice';
import financialAccountReducer from './slices/financialAccountSlice';
import inventory_ItemReducer from './slices/inventory_ItemSlice';
import inventoryItemAltReducer from './slices/inventoryItemAltSlice';
import inventoryMovementReducer from './slices/inventoryMovementSlice';
import inventoryRequisitionReducer from './slices/requisitionsSlice';
import inventoryVoucherReducer from './slices/inventoryVoucherSlice';
import productComponentReducer from './slices/productComponentSlice';
import productVariantReducer from './slices/productVariantSlice';
import projectReducer from './slices/projectSlice';
import purchaseOrderReducer from './slices/purchaseOrderSlice';
import purchaseInvoiceReducer from './slices/purchaseInvoiceSlice';
import stockMovementReducer from './slices/stockMovementSlice';
import supplierReducer from './slices/supplierSlice';

export const store = configureStore({
  reducer: {
    branches: branchReducer,
    inventory: inventoryReducer,
    branchInventory: branchInventoryReducer,
    movements: movementsReducer,
    requisitions: requisitionsReducer,
    vouchers: vouchersReducer,
    stockMovements: stockMovementsReducer,
    products: productsReducer,
    posProducts: posProductsReducer,
    customers: customersReducer,
    supplies: suppliesReducer,
    supplyInventory: supplyInventoryReducer,
    supplyMovements: supplyMovementsReducer,
    supplyChainItems: supplyChainItemsReducer,
    supplyChain: supplyChainReducer,
    manufacturingOrders: manufacturingOrdersReducer,
    import: importReducer,
    financialaccounts: financialAccountReducer,
    inventory_items: inventory_ItemReducer,
    inventoryitemalts: inventoryItemAltReducer,
    inventorymovements: inventoryMovementReducer,
    inventoryrequisitions: inventoryRequisitionReducer,
    inventoryvouchers: inventoryVoucherReducer,
    productcomponents: productComponentReducer,
    productvariants: productVariantReducer,
    projects: projectReducer,
    purchaseorders: purchaseOrderReducer,
    purchaseinvoices: purchaseInvoiceReducer,
    stockmovements: stockMovementReducer,
    suppliers: supplierReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
