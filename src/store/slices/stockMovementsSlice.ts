import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../config/api';

export interface StockMovement {
  _id?: string;
  id?: string;
  productId: string;
  branchId: string;
  movementType: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  referenceType: 'MANUAL' | 'PURCHASE' | 'SALE' | 'TRANSFER' | 'ADJUSTMENT';
  referenceId?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

interface StockMovementState {
  items: StockMovement[];
  loading: boolean;
  error: string | null;
}

const initialState: StockMovementState = { items: [], loading: false, error: null };

export const fetchStockMovements = createAsyncThunk('stockMovements/fetchAll', async () => {
  const res = await fetch(`${API_BASE_URL}/stock-movements`);
  if (!res.ok) throw new Error('Failed to fetch stock movements');
  return res.json();
});

export const createStockMovement = createAsyncThunk('stockMovements/create', async (data: Partial<StockMovement>) => {
  const res = await fetch(`${API_BASE_URL}/stock-movements`, { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(data) 
  });
  if (!res.ok) throw new Error('Failed to create stock movement');
  return res.json();
});

const stockMovementsSlice = createSlice({
  name: 'stockMovements',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStockMovements.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchStockMovements.fulfilled, (s, a) => { s.loading = false; s.items = a.payload.data || []; })
      .addCase(fetchStockMovements.rejected, (s, a) => { s.loading = false; s.error = a.error.message || 'Failed to fetch'; })
      .addCase(createStockMovement.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createStockMovement.fulfilled, (s, a) => { 
        s.loading = false; 
        const newItem = a.payload?.data || a.payload;
        if (newItem) s.items.unshift(newItem);
      })
      .addCase(createStockMovement.rejected, (s, a) => { s.loading = false; s.error = a.error.message || 'Failed to create'; });
  }
});

export default stockMovementsSlice.reducer;