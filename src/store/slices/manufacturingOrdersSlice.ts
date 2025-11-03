
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import { ManufacturingOrder } from '../../../types';

export const fetchManufacturingOrders = createAsyncThunk('manufacturingorders/list', async () => {
  const response = await fetch(`${API_BASE_URL}/manufacturing-orders`);
  return response.json();
});

export const createManufacturingOrder = createAsyncThunk(
  'manufacturingorders/create',
  async (order: ManufacturingOrder) => {
    const response = await fetch(`${API_BASE_URL}/manufacturing-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });
    return response.json();
  }
);

export const updateManufacturingOrder = createAsyncThunk(
  'manufacturingorders/update',
  async (order: ManufacturingOrder) => {
    const response = await fetch(`${API_BASE_URL}/manufacturing-orders/${order.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });
    return response.json();
  }
);

const manufacturingOrdersSlice = createSlice({
  name: 'manufacturingorders',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchManufacturingOrders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchManufacturingOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = Array.isArray(action.payload) ? action.payload : action.payload.data || [];
      })
      .addCase(fetchManufacturingOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createManufacturingOrder.fulfilled, (state, action) => {
        const newItem = action.payload.data || action.payload;
        state.items.push(newItem);
      })
      .addCase(updateManufacturingOrder.fulfilled, (state, action) => {
        const updatedItem = action.payload.data || action.payload;
        const index = state.items.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
          state.items[index] = updatedItem;
        }
      });
  },
});

export default manufacturingOrdersSlice.reducer;
