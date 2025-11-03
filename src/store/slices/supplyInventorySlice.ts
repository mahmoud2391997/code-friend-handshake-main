// src/store/slices/supplyInventorySlice.ts
import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
} from '@reduxjs/toolkit';
import { SupplyInventory, SupplyMovement } from '../../../types';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';

interface SupplyInventoryState {
  items: SupplyInventory[];
  movements: SupplyMovement[];
  loading: boolean;
  error: string | null;
}

const initialState: SupplyInventoryState = {
  items: [],
  movements: [],
  loading: false,
  error: null,
};

const toApi = (item: SupplyInventory): any => ({
  productId: String((item as any).productId ?? item.supplyId),
  branchId: String((item as any).branchId ?? item.branchId),
  quantity: item.quantity,
  minStock: item.minStock,
  reorderPoint: item.reorderPoint,
  lastMovementDate: item.lastMovementDate,
});

const fromApi = (raw: any): SupplyInventory => ({
  supplyId: String(raw.productId ?? raw.supplyId),
  branchId: String(raw.branchId),
  quantity: Number(raw.quantity) || 0,
  minStock: raw.minStock != null ? Number(raw.minStock) : undefined,
  reorderPoint: raw.reorderPoint != null ? Number(raw.reorderPoint) : undefined,
  lastMovementDate: raw.lastMovementDate,
});

export const fetchSupplyInventory = createAsyncThunk(
  'supplyInventory/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.STOCK_MOVEMENTS}`);
      const txt = await res.text();
      if (!res.ok) throw new Error(`Failed: ${res.status} ${txt}`);
      const json = txt ? JSON.parse(txt) : {};
      const arr = Array.isArray(json)
        ? json
        : json.data ?? json.items ?? [];
      return arr.map(fromApi);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const createSupplyInventoryItem = createAsyncThunk(
  'supplyInventory/create',
  async (item: SupplyInventory, { rejectWithValue }) => {
    try {
      const payload = toApi(item);
      if (!payload.productId || !payload.branchId)
        throw new Error('productId and branchId are required');
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.STOCK_MOVEMENTS}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const txt = await res.text();
      if (!res.ok) throw new Error(txt || 'Failed to create');
      const data = txt ? JSON.parse(txt) : {};
      return fromApi(data.data ?? data);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateSupplyInventoryItem = createAsyncThunk(
  'supplyInventory/update',
  async ({ id, data }: { id: string; data: SupplyInventory }, { rejectWithValue }) => {
    try {
      const payload = toApi(data);
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.STOCK_MOVEMENTS}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const txt = await res.text();
      if (!res.ok) throw new Error(txt || 'Failed to update');
      const json = txt ? JSON.parse(txt) : {};
      return fromApi(json.data ?? json);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteSupplyInventoryItem = createAsyncThunk(
  'supplyInventory/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.STOCK_MOVEMENTS}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const createSupplyMovement = createAsyncThunk(
  'supplyInventory/createMovement',
  async (movement: Omit<SupplyMovement, 'id' | 'date'>, { dispatch, rejectWithValue }) => {
    try {
      const { supplyId, branchId, ...rest } = movement;
      const payload = {
        supplyId: supplyId,
        branchId: branchId,
        ...rest,
      };
      // Assuming you have an endpoint for creating movements
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.STOCK_MOVEMENTS}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.log(errorText);
        
        console.error('Error creating supply movement:', errorText);
        throw new Error(errorText || 'Failed to create movement');
      }
      const newMovement = await res.json();
      dispatch(addMovement(newMovement));
      return newMovement;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);


export const supplyInventorySlice = createSlice({
  name: 'supplyInventory',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addMovement: (state, action: PayloadAction<SupplyMovement>) => {
      const m = action.payload;
      state.movements.push(m);

      const key = `${m.supplyId}-${m.branchId}`;
      const idx = state.items.findIndex(i => `${i.supplyId}-${i.branchId}` === key);

      if (idx === -1) {
        state.items.push({
          supplyId: String(m.supplyId),
          branchId: String(m.branchId),
          quantity: m.type === 'IN' ? m.quantity : -m.quantity,
          lastMovementDate: m.date,
        });
      } else {
        const cur = state.items[idx].quantity ?? 0;
        state.items[idx].quantity =
          m.type === 'IN' ? cur + m.quantity : Math.max(0, cur - m.quantity);
        state.items[idx].lastMovementDate = m.date;
      }
    },
    deleteMovement: (state, action: PayloadAction<string>) => {
      state.movements = state.movements.filter(m => m.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSupplyInventory.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchSupplyInventory.fulfilled, (s, a: PayloadAction<SupplyInventory[]>) => {
        s.loading = false;
        s.items = a.payload;
      })
      .addCase(fetchSupplyInventory.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      })

      .addCase(createSupplyInventoryItem.fulfilled, (s, a: PayloadAction<SupplyInventory>) => {
        s.items.push(a.payload);
      })

      .addCase(updateSupplyInventoryItem.fulfilled, (s, a: PayloadAction<SupplyInventory>) => {
        const idx = s.items.findIndex(
          i => String(i.supplyId) === String(a.payload.supplyId) && String(i.branchId) === String(a.payload.branchId)
        );
        if (idx !== -1) s.items[idx] = a.payload;
      })

      .addCase(deleteSupplyInventoryItem.fulfilled, (s, a: PayloadAction<string>) => {
        s.items = s.items.filter(i => i.supplyId !== a.payload && i.branchId !== a.payload);
      });
  },
});

export const {
  setLoading,
  setError,
  addMovement,
  deleteMovement,
} = supplyInventorySlice.actions;

export default supplyInventorySlice.reducer;