/// <reference types="vite/client" />

export const API_BASE_URL = '/api';

export const API_ENDPOINTS = {
  AUTH_LOGIN: `/auth/login`,
  BRANCHES: `/branches`,
  BRANCH_INVENTORIES: `/branchinventories`,
  CUSTOMERS: `/customers`,
  EMPLOYEES: `/employees`,
  EXPENSES: `/expenses`,
  FINANCIAL_ACCOUNTS: `/financialaccounts`,
  INVENTORY_ITEMS: `/inventory_items`,
  INVENTORY_ITEM_ALTS: `/inventoryitemalts`,
  INVENTORY_MOVEMENTS: `/inventorymovements`,
  INVENTORY_REQUISITIONS: `/requisitions`,
  INVENTORY_VOUCHERS: `/inventoryvouchers`,
  MANUFACTURING_ORDERS: `/manufacturing_orders`,
  PRODUCT_COMPONENTS: `/productcomponents`,
  PRODUCTS: `/products`,
  PRODUCT_VARIANTS: `/productvariants`,
  PROJECTS: `/projects`,
  PURCHASE_INVOICES: `/purchaseinvoices`,
  PURCHASE_ORDERS: `/purchaseorders`,
  SALES: `/sales`,
  SCANS: `/scans`,
  STOCK_MOVEMENTS: `/supply-movements`,
  SUPPLIERS: `/suppliers`,
  // SUPPLY_CHAIN_ITEMS: `/supplychainitems`,
  // SUPPLY_CHAIN_ITEMS: `/supplychains`,
   SUPPLY_CHAIN_ITEMS: `/supply-chain`,
  SUPPLY_CHAINS: `/supply-movements`,
  SUPPLY_ORDERS: `/supplyorders`,
  USERS: `/users`,
} as const;

export const setupApiErrorLogging = (store: any) => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    try {
      const response = await originalFetch(input, init);
      if (!response.ok) {
        console.error('[API NETWORK ERROR]', {
            url: response.url,
            method: init?.method || 'GET',
            status: response.status,
            statusText: response.statusText,
        });
      }
      return response;
    } catch (error) {
      console.error('[API FETCH THREW ERROR]', { error });
      throw error;
    }
  };
};
