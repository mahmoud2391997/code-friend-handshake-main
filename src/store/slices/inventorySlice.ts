import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../config/api';

export interface InventoryItem {
  id: string;
  productId: string;
  branchId: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  quantity: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  location?: string;
  lastRestocked?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface InventoryState {
  items: InventoryItem[];
  currentItem: InventoryItem | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
}

const initialState: InventoryState = {
  items: [],
  currentItem: null,
  loading: false,
  error: null,
  pagination: null,
};

export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const qp = new URLSearchParams();
      if (params.page) qp.append('page', String(params.page));
      if (params.limit) qp.append('limit', String(params.limit));
      
      const response = await fetch(`${API_BASE_URL}/inventory?${qp.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch inventory');
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchInventoryByBranch = createAsyncThunk(
  'inventory/fetchByBranch',
  async (params: { branchId: string, page?: number, limit?: number }, { rejectWithValue }) => {
    try {
      const { branchId, page, limit } = params;
      const qp = new URLSearchParams();
      if (page) qp.append('page', String(page));
      if (limit) qp.append('limit', String(limit));

      const response = await fetch(`${API_BASE_URL}/inventory/branch/${branchId}?${qp.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch inventory for branch');
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createInventoryItem = createAsyncThunk(
  'inventory/create',
  async (itemData: Omit<InventoryItem, 'id'>, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create inventory item');
      }
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createInventoryItemBatch = createAsyncThunk(
  'inventory/createBatch',
  async (items: Omit<InventoryItem, 'id'>[], { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create inventory items in batch');
      }
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);


export const updateInventoryItem = createAsyncThunk(
  'inventory/update',
  async ({ id, data }: { id: string; data: Partial<InventoryItem> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update inventory item');
      }
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteInventoryItem = createAsyncThunk(
  'inventory/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete inventory item');
      }
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const importInventory = createAsyncThunk(
  'inventory/import',
  async (items: Omit<InventoryItem, 'id'>[], { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to import inventory items');
      }
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
)

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearInventoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : action.payload.data || [];
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchInventoryByBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryByBranch.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : action.payload.data || [];
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchInventoryByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createInventoryItem.fulfilled, (state, action: PayloadAction<any>) => {
        const newItem = action.payload.data || action.payload;
        state.items.unshift(newItem);
      })
      .addCase(createInventoryItemBatch.fulfilled, (state, action: PayloadAction<{ data: InventoryItem[] }>) => {
        state.items.unshift(...action.payload.data);
      })
      .addCase(updateInventoryItem.fulfilled, (state, action: PayloadAction<any>) => {
        const updatedItem = action.payload.data || action.payload;
        const index = state.items.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
          state.items[index] = updatedItem;
        }
      })
      .addCase(deleteInventoryItem.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(importInventory.fulfilled, (state, action: PayloadAction<{ data: InventoryItem[] }>) => {
        state.items.unshift(...action.payload.data);
      })
  },
});

export const { clearInventoryError } = inventorySlice.actions;
export default inventorySlice.reducer;
