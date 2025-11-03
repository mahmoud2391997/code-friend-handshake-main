import { API_BASE_URL } from '../../config/api';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// --------------------
// Types
// --------------------
interface SupplyMovement {
  id: string;
  supplyId: string;
  movementType: 'IN' | 'OUT';
  quantity: number;
  fromBranch?: string;
  toBranch?: string;
  branchId?: string;
  date?: string;
  notes?: string;
  reason?: string;
  createdBy?: number;
  createdAt?: string;
  _id?: string;
}

interface SupplyMovementsState {
  movements: SupplyMovement[];
  loading: boolean;
  error: string | null;
}

// --------------------
// Initial State
// --------------------
const initialState: SupplyMovementsState = {
  movements: [],
  loading: false,
  error: null,
};

// --------------------
// Async Thunks
// --------------------

// ✅ Fetch all supply movements
export const fetchSupplyMovements = createAsyncThunk(
  'supplyMovements/fetchSupplyMovements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/supply-movements`);
      if (!response.ok) throw new Error('Failed to fetch supply movements');

      const data = await response.json();

      const mappedData = data.map((m: any) => ({
        ...m,
        id: m._id,
        supplyId: m.supplyId,
        movementType: m.type || m.movementType,
        branchId: m.toBranch || m.fromBranch || m.branchId,
        date: m.createdAt || m.date,
        reason: m.notes || m.reason,
      }));

      return mappedData;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Create IN movement
export const createSupplyInMovement = createAsyncThunk(
  'supplyMovements/createSupplyInMovement',
  async (
    movementData: { supplyId: string; branchId: string; quantity: number; notes?: string; createdBy: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/supply-movements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...movementData, type: 'IN'}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create supply movement');
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Create OUT movement
export const createSupplyOutMovement = createAsyncThunk(
  'supplyMovements/createSupplyOutMovement',
  async (
    movementData: { supplyId: string; branchId: string; quantity: number; notes?: string; createdBy: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/supply-movements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...movementData, type: 'OUT'}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create supply movement');
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Delete movement
export const deleteSupplyMovement = createAsyncThunk(
  'supplyMovements/deleteSupplyMovement',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/supply-movements/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete movement');
      }

      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Import movements from Excel or external data
export const importSupplyMovements = createAsyncThunk(
  'supplyMovements/importSupplyMovements',
  async (
    movementsData: Array<{
      supplyId: string;
      branchId: string;
      quantity: number;
      movementType: 'IN' | 'OUT';
      notes?: string;
      createdBy: number;
      date?: string;
    }>,
    { rejectWithValue }
  ) => {
    try {
      const results: any[] = [];

      for (const movement of movementsData) {
        const endpoint = `${API_BASE_URL}/supply-movements`;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...movement,
            type: movement.movementType
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to create ${movement.movementType} movement`);
        }

        const newMovement = await response.json();
        results.push(newMovement);
      }

      return results;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// --------------------
// Slice Definition
// --------------------
const supplyMovementsSlice = createSlice({
  name: 'supplyMovements',
  initialState,
  reducers: {
    clearMovements: (state) => {
      state.movements = [];
      state.error = null;
    },
    addMovement: (state, action: PayloadAction<SupplyMovement>) => {
      state.movements.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchSupplyMovements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplyMovements.fulfilled, (state, action: PayloadAction<SupplyMovement[]>) => {
        state.loading = false;
        state.movements = action.payload;
      })
      .addCase(fetchSupplyMovements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create IN
      .addCase(createSupplyInMovement.fulfilled, (state, action: PayloadAction<SupplyMovement>) => {
        state.movements.push(action.payload);
      })

      // Create OUT
      .addCase(createSupplyOutMovement.fulfilled, (state, action: PayloadAction<SupplyMovement>) => {
        state.movements.push(action.payload);
      })

      // Delete
      .addCase(deleteSupplyMovement.fulfilled, (state, action: PayloadAction<string>) => {
        state.movements = state.movements.filter((m) => m._id !== action.payload);
      })

      // Import
      .addCase(importSupplyMovements.fulfilled, (state, action: PayloadAction<SupplyMovement[]>) => {
        state.movements.push(...action.payload);
      });
  },
});

// --------------------
// Exports
// --------------------
export const { clearMovements, addMovement } = supplyMovementsSlice.actions;

export default supplyMovementsSlice.reducer;
