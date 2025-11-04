import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';

interface SupplyOrder {
  _id?: string;
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  items: Array<{
    supplyId: string;
    supplyName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  totalAmount: number;
  status: 'PENDING' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';
  orderDate: string;
  expectedDelivery?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

interface SupplyOrdersState {
  orders: SupplyOrder[];
  loading: boolean;
  error: string | null;
}

const mockOrders: SupplyOrder[] = [
  {
    id: '1',
    orderNumber: 'SO-001',
    supplierId: '1',
    supplierName: 'شركة الورود البلغارية',
    items: [
      {
        supplyId: '1',
        supplyName: 'زيت الورد البلغاري',
        quantity: 10,
        unitPrice: 500,
        total: 5000
      }
    ],
    totalAmount: 5000,
    status: 'PENDING',
    orderDate: new Date().toISOString(),
    createdBy: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    orderNumber: 'SO-002',
    supplierId: '2',
    supplierName: 'مؤسسة العود الكمبودي',
    items: [
      {
        supplyId: '2',
        supplyName: 'زيت العود الكمبودي',
        quantity: 5,
        unitPrice: 1200,
        total: 6000
      }
    ],
    totalAmount: 6000,
    status: 'APPROVED',
    orderDate: new Date().toISOString(),
    createdBy: 'admin',
    createdAt: new Date().toISOString()
  }
];

const initialState: SupplyOrdersState = {
  orders: [],
  loading: false,
  error: null,
};

export const fetchSupplyOrders = createAsyncThunk(
  'supplyOrders/fetchSupplyOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SUPPLY_ORDERS}`);
      if (!response.ok) {
        throw new Error('Failed to fetch supply orders');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching supply orders:', error);
      return [];
    }
  }
);

export const createSupplyOrder = createAsyncThunk(
  'supplyOrders/createSupplyOrder',
  async (orderData: Omit<SupplyOrder, 'id' | '_id' | 'orderNumber' | 'createdAt'>, { rejectWithValue }) => {
    try {
      const newOrder: SupplyOrder = {
        ...orderData,
        id: Date.now().toString(),
        orderNumber: `SO-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      return newOrder;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateSupplyOrderStatus = createAsyncThunk(
  'supplyOrders/updateSupplyOrderStatus',
  async ({ id, status }: { id: string; status: SupplyOrder['status'] }, { rejectWithValue }) => {
    try {
      return { id, status };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const supplyOrdersSlice = createSlice({
  name: 'supplyOrders',
  initialState,
  reducers: {
    clearOrders: (state) => {
      state.orders = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSupplyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchSupplyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createSupplyOrder.fulfilled, (state, action) => {
        state.orders.push(action.payload);
      })
      .addCase(updateSupplyOrderStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const order = state.orders.find(o => o.id === id || o._id === id);
        if (order) {
          order.status = status;
        }
      });
  },
});

export const { clearOrders } = supplyOrdersSlice.actions;
export default supplyOrdersSlice.reducer;