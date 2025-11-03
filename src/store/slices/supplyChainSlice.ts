import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../config/api';

export interface SupplyChainItem {
  id: number;
  sku?: string;
  gtin?: string;
  batchNumber?: string;
  serialNumber?: string;
  productName: string;
  quantity: number;
  unit?: string;
  manufacturer?: string;
  originCountry?: string;
  manufactureDate?: string;
  expiryDate?: string;
  currentStatus?: string;
  transportMode?: string;
  created_at?: string;
  updated_at?: string;
}

interface SupplyChainState {
  items: SupplyChainItem[];
  loading: boolean;
  error: string | null;
}

const initialState: SupplyChainState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchSupplyChainItems = createAsyncThunk(
  'supplyChain/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/supply-chain`);
      if (!response.ok) throw new Error('Failed to fetch supply chain items');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createSupplyChainItem = createAsyncThunk(
  'supplyChain/createItem',
  async (itemData: Partial<SupplyChainItem>, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/supply-chain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      if (!response.ok) throw new Error('Failed to create supply chain item');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateSupplyChainItem = createAsyncThunk(
  'supplyChain/updateItem',
  async ({ id, data }: { id: number; data: Partial<SupplyChainItem> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/supply-chain/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update supply chain item');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteSupplyChainItem = createAsyncThunk(
  'supplyChain/deleteItem',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/supply-chain/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete supply chain item');
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const supplyChainSlice = createSlice({
  name: 'supplyChain',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSupplyChainItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplyChainItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchSupplyChainItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createSupplyChainItem.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateSupplyChainItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteSupplyChainItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  },
});

export const { clearError } = supplyChainSlice.actions;
export default supplyChainSlice.reducer;