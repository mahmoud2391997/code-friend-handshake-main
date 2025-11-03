
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';

export const list = createAsyncThunk('stockmovements/list', async () => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SUPPLY_CHAINS}`);
  return response.json();
});

const stockMovementSlice = createSlice({
  name: 'stockmovements',
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

export default stockMovementSlice.reducer;
