import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import { SupplyChainItem } from '@/types';

type Pagination = {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
} | null;

interface SupplyChainItemsState {
  items: SupplyChainItem[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
}

const mockSupplyItems: SupplyChainItem[] = [
  {
    _id: '1',
    id: 1,
    productName: 'زيت الورد البلغاري',
    sku: 'ROSE-OIL-001',
    quantity: 50,
    unit: 'ml',
    manufacturer: 'Bulgarian Rose Co.',
    status: 'Active'
  },
  {
    _id: '2',
    id: 2,
    productName: 'زيت العود الكمبودي',
    sku: 'OUD-CAM-001',
    quantity: 25,
    unit: 'ml',
    manufacturer: 'Cambodia Oud Ltd.',
    status: 'Active'
  },
  {
    _id: '3',
    id: 3,
    productName: 'مسك أبيض طبيعي',
    sku: 'MUSK-WHT-001',
    quantity: 100,
    unit: 'g',
    manufacturer: 'Natural Musk Co.',
    status: 'Active'
  },
  {
    _id: '4',
    id: 4,
    productName: 'كحول إيثيلي 96%',
    sku: 'ETH-ALC-96',
    quantity: 1000,
    unit: 'ml',
    manufacturer: 'Chemical Supplies Inc.',
    status: 'Active'
  },
  {
    _id: '5',
    id: 5,
    productName: 'زجاجات عطر 50ml',
    sku: 'BOTTLE-50ML',
    quantity: 500,
    unit: 'pcs',
    manufacturer: 'Glass Works Ltd.',
    status: 'Active'
  }
];

const initialState: SupplyChainItemsState = {
  items: [],
  loading: false,
  error: null,
  pagination: null,
};

/* --------------------------------------------------------------------- */
/*                     API ↔ Frontend Format Converters                    */
/* --------------------------------------------------------------------- */
const toApiFormat = (item: any) => {
  const { productName, id, ...rest } = item;
  const numericId = typeof id === 'number' && Number.isFinite(id) && id > 0 ? id : Date.now();
  return {
    ...rest,
    id: numericId,
    productName,
    name: productName, // API expects `name`
  };
};

const fromApiFormat = (item: any): SupplyChainItem => {
  const { name, productName, ...rest } = item;
  return {
    ...rest,
    productName: productName ?? name ?? '',
  };
};

/* --------------------------------------------------------------------- */
/*                               Thunks                                   */
/* --------------------------------------------------------------------- */

/* ------------------------------- FETCH ------------------------------- */
export const fetchSupplyChainItems = createAsyncThunk(
  'supplyChainItems/fetchAll',
  async (params: { page?: number; limit?: number; q?: string } | undefined, { rejectWithValue }) => {
    try {
      // Return mock data instead of API call
      let filteredItems = mockSupplyItems;
      
      // Apply search filter if provided
      if (params?.q) {
        const query = params.q.toLowerCase();
        filteredItems = mockSupplyItems.filter(item => 
          item.productName.toLowerCase().includes(query) ||
          item.sku?.toLowerCase().includes(query) ||
          item.manufacturer?.toLowerCase().includes(query)
        );
      }

      return {
        items: filteredItems,
        pagination: null,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

/* ------------------------------- CREATE ------------------------------- */
export const createSupplyChainItem = createAsyncThunk(
  'supplyChainItems/create',
  async (item: Omit<SupplyChainItem, 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      // Mock creation instead of API call
      const newItem: SupplyChainItem = {
        ...item,
        _id: Date.now().toString(),
        id: Date.now()
      };
      return newItem;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

/* ------------------------------- UPDATE ------------------------------- */
export const updateSupplyChainItem = createAsyncThunk(
  'supplyChainItems/update',
  async (item: SupplyChainItem, { rejectWithValue }) => {
    try {
      // Mock update instead of API call
      return item;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

/* ------------------------------- DELETE ------------------------------- */
export const deleteSupplyChainItem = createAsyncThunk(
  'supplyChainItems/delete',
  async (id: number | { id?: number; _id?: string }, { rejectWithValue }) => {
    try {
      const identifier = typeof id === 'object' && id !== null && (id as any)._id
        ? (id as any)._id
        : (typeof id === 'number' || typeof id === 'string' ? id : (id as any)?.id);
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SUPPLY_CHAIN_ITEMS}/${identifier}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Failed to delete: ${res.status}`);
      return typeof id === 'object' && id !== null ? (id as any)?.id : id;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

/* ------------------------------- IMPORT (REAL API) ------------------------------- */
export const importItems = createAsyncThunk(
  'supplyChainItems/import',
  async (items: Omit<SupplyChainItem, 'id' | 'created_at' | 'updated_at'>[], { rejectWithValue }) => {
    try {
      // Convert all items to API format
      const payload = items.map(toApiFormat);

      console.log('Importing items via API:', payload);

      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SUPPLY_CHAIN_ITEMS}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log('Import API Response:', res.status, text);

      if (!res.ok) {
        throw new Error(`Import failed: ${res.status} - ${text}`);
      }

      let data: any;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${text}`);
      }

      // Handle possible response shapes:
      // { data: [...] }, { items: [...] }, or just [...]
      const imported = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.items)
        ? data.items
        : [];

      if (!Array.isArray(imported) || imported.length === 0) {
        console.warn('Import succeeded but no items returned');
        return [];
      }

      return imported.map(fromApiFormat);
    } catch (err: any) {
      console.error('Import error:', err);
      return rejectWithValue(err.message || 'Import failed');
    }
  }
);

/* --------------------------------------------------------------------- */
/*                               Slice                                    */
/* --------------------------------------------------------------------- */
const supplyChainItemsSlice = createSlice({
  name: 'supplyChainItems',
  initialState,
  reducers: {
    setItems(state, action: PayloadAction<SupplyChainItem[]>) {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ------------------- FETCH ------------------- */
      .addCase(fetchSupplyChainItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplyChainItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSupplyChainItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ------------------- CREATE ------------------- */
      .addCase(createSupplyChainItem.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })

      /* ------------------- UPDATE ------------------- */
      .addCase(updateSupplyChainItem.fulfilled, (state, action) => {
        const idx = state.items.findIndex((i) => i.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })

      /* ------------------- DELETE ------------------- */
      .addCase(deleteSupplyChainItem.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.id !== action.payload);
      })

      /* ------------------- IMPORT ------------------- */
      .addCase(importItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(importItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [...state.items, ...action.payload];
      })
      .addCase(importItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setItems } = supplyChainItemsSlice.actions;
export default supplyChainItemsSlice.reducer;
