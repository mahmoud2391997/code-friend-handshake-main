
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';

export const list = createAsyncThunk('suppliers/list', async () => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SUPPLIERS}`);
  return response.json();
});

const supplierSlice = createSlice({
  name: 'suppliers',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(list.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(list.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(list.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default supplierSlice.reducer;
