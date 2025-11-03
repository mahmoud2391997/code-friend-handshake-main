import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Supply } from '../../../types';
import { API_BASE_URL } from '../../config/api';

interface SuppliesState {
  items: Supply[];
  loading: boolean;
  error: string | null;
}

const initialState: SuppliesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchSupplies = createAsyncThunk(
  'supplies/fetchAll',
  async (params: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const url = new URL(`${API_BASE_URL}/supply-chain/supplies`);
      if (params.page) url.searchParams.append('page', String(params.page));
      if (params.limit) url.searchParams.append('limit', String(params.limit));
      
      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error(`Failed to fetch supplies: ${res.statusText}`);
      }
      const json = await res.json();
      return json.data as Supply[]; // Assuming the API returns { data: [...] }
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const suppliesSlice = createSlice({
  name: 'supplies',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSupplies: (state, action: PayloadAction<Supply[]>) => {
      state.items = action.payload;
    },
    addSupply: (state, action: PayloadAction<Supply>) => {
      state.items.push(action.payload);
    },
    updateSupply: (state, action: PayloadAction<Supply>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteSupply: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    importSupplies: (state, action: PayloadAction<Supply[]>) => {
      // Merge imported supplies with existing ones, avoiding duplicates by SKU
      const existingSkus = new Set(state.items.map(item => item.sku));
      const newSupplies = action.payload.filter(item => !existingSkus.has(item.sku));
      state.items = [...state.items, ...newSupplies];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSupplies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplies.fulfilled, (state, action: PayloadAction<Supply[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSupplies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { 
  setLoading, 
  setError, 
  setSupplies, 
  addSupply, 
  updateSupply, 
  deleteSupply,
  importSupplies
} = suppliesSlice.actions;

export default suppliesSlice.reducer;