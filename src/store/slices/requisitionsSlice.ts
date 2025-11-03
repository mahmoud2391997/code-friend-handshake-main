import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../config/api';

export interface InventoryRequisitionItem { productId: number; quantity: number; }
export interface InventoryRequisition {
  _id?: string;
  id?: string;
  code?: string;
  date: string;
  branchId?: string;
  branchName?: string;
  type: 'Purchase' | 'Transfer';
  items: InventoryRequisitionItem[];
  notes?: string;
  attachments?: any[];
  status?: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
}

interface RequisitionState {
  items: InventoryRequisition[];
  loading: boolean;
  error: string | null;
}

const initialState: RequisitionState = { items: [], loading: false, error: null };

export const fetchRequisitions = createAsyncThunk('requisitions/fetchAll', async () => {
  const res = await fetch(`${API_BASE_URL}/requisitions`);
  if (!res.ok) throw new Error('Failed to fetch requisitions');
  return res.json();
});

export const createRequisition = createAsyncThunk('requisitions/create', async (data: Partial<InventoryRequisition>) => {
  console.log('createRequisition thunk called with:', data);
  console.log('Making request to:', `${API_BASE_URL}/requisitions`);
  const res = await fetch(`${API_BASE_URL}/requisitions`, { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(data) 
  });
  console.log('Response status:', res.status);
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Request failed:', errorText);
    throw new Error(`Failed to create requisition: ${res.status} ${errorText}`);
  }
  const result = await res.json();
  console.log('Response data:', result);
  return result;
});

export const updateRequisition = createAsyncThunk('requisitions/update', async ({ id, data }: { id: string; data: Partial<InventoryRequisition> }) => {
  const res = await fetch(`${API_BASE_URL}/requisitions/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update requisition');
  return res.json();
});

export const deleteRequisition = createAsyncThunk('requisitions/delete', async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/requisitions/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete requisition');
  return { id };
});

const requisitionsSlice = createSlice({
  name: 'requisitions',
  initialState,
  reducers: {
    setRequisitions: (state, action) => {
      state.items = action.payload;
    },
    addRequisition: (state, action) => {
      state.items.unshift(action.payload);
    },
    updateRequisitionInState: (state, action) => {
      const index = state.items.findIndex(r => (r.id || r._id) === (action.payload.id || action.payload._id));
      if (index !== -1) state.items[index] = action.payload;
    },
    removeRequisition: (state, action) => {
      state.items = state.items.filter(r => (r.id || r._id) !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequisitions.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchRequisitions.fulfilled, (s, a: PayloadAction<any>) => { s.loading = false; s.items = a.payload.data || a.payload || []; })
      .addCase(fetchRequisitions.rejected, (s, a) => { s.loading = false; s.error = a.error.message || 'Failed to fetch requisitions'; })
      .addCase(createRequisition.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createRequisition.fulfilled, (s, a: PayloadAction<any>) => { 
        s.loading = false; 
        const newItem = a.payload?.data || a.payload;
        if (newItem) s.items.unshift(newItem);
      })
      .addCase(createRequisition.rejected, (s, a) => { 
        s.loading = false; 
        s.error = a.error.message || 'Failed to create requisition';
        console.error('Create requisition failed:', a.error);
      })
      .addCase(updateRequisition.fulfilled, (s, a: PayloadAction<any>) => {
        const updated = a.payload?.data; if (!updated) return; const id = updated.id || updated._id; const idx = s.items.findIndex(r => (r.id || r._id) === id); if (idx !== -1) s.items[idx] = updated;
      })
      .addCase(deleteRequisition.fulfilled, (s, a: PayloadAction<{ id: string }>) => {
        s.items = s.items.filter(r => (r.id || r._id) !== a.payload.id);
      });
  }
});

export const { setRequisitions, addRequisition, updateRequisitionInState, removeRequisition, setLoading, setError } = requisitionsSlice.actions;
export default requisitionsSlice.reducer;
