import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';

interface SupplySupplier {
  _id?: string;
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  suppliedMaterials: string[];
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

interface SupplySuppliersState {
  suppliers: SupplySupplier[];
  loading: boolean;
  error: string | null;
}

const mockSuppliers: SupplySupplier[] = [
  {
    id: '1',
    name: 'شركة الورود البلغارية',
    contactPerson: 'أحمد محمد',
    phone: '+966501234567',
    email: 'ahmed@bulgarianrose.com',
    address: 'الرياض، المملكة العربية السعودية',
    suppliedMaterials: ['زيت الورد البلغاري', 'زيت الياسمين'],
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'مؤسسة العود الكمبودي',
    contactPerson: 'سارة أحمد',
    phone: '+966507654321',
    email: 'sara@cambodianoud.com',
    address: 'جدة، المملكة العربية السعودية',
    suppliedMaterials: ['زيت العود الكمبودي', 'خشب العود'],
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'شركة المواد الكيميائية',
    contactPerson: 'محمد علي',
    phone: '+966509876543',
    email: 'mohammed@chemicals.com',
    address: 'الدمام، المملكة العربية السعودية',
    suppliedMaterials: ['كحول إيثيلي', 'مواد حافظة'],
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  }
];

const initialState: SupplySuppliersState = {
  suppliers: [],
  loading: false,
  error: null,
};

export const fetchSupplySuppliers = createAsyncThunk(
  'supplySuppliers/fetchSupplySuppliers',
  async (_, { rejectWithValue }) => {
    try {
      // Return mock data instead of API call
      return mockSuppliers;
    } catch (error) {
      console.error('Error fetching supply suppliers:', error);
      return [];
    }
  }
);

export const createSupplySupplier = createAsyncThunk(
  'supplySuppliers/createSupplySupplier',
  async (supplierData: Omit<SupplySupplier, 'id' | '_id' | 'createdAt'>, { rejectWithValue }) => {
    try {
      const newSupplier: SupplySupplier = {
        ...supplierData,
        id: Date.now().toString(),
        _id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      return newSupplier;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateSupplySupplier = createAsyncThunk(
  'supplySuppliers/updateSupplySupplier',
  async ({ id, data }: { id: string; data: Partial<SupplySupplier> }, { rejectWithValue }) => {
    try {
      return { id, data };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const supplySuppliersSlice = createSlice({
  name: 'supplySuppliers',
  initialState,
  reducers: {
    clearSuppliers: (state) => {
      state.suppliers = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSupplySuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplySuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = action.payload;
      })
      .addCase(fetchSupplySuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createSupplySupplier.fulfilled, (state, action) => {
        state.suppliers.push(action.payload);
      })
      .addCase(updateSupplySupplier.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        const index = state.suppliers.findIndex(s => s.id === id || s._id === id);
        if (index !== -1) {
          state.suppliers[index] = { ...state.suppliers[index], ...data };
        }
      });
  },
});

export const { clearSuppliers } = supplySuppliersSlice.actions;
export default supplySuppliersSlice.reducer;