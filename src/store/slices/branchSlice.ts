// src/store/slices/branchesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Branch } from '@/types';
import { API_BASE_URL } from '../../config/api';

// Helper to normalize branch data
const normalizeBranch = (branch: any): Branch => ({
  ...branch,
  _id: String(branch._id), // Ensure _id is always present and is a string
});

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface Stats {
  totalBranches: number;
  activeBranches: number;
  inactiveBranches: number;
  suspendedBranches: number;
  projectStats: any[];
  businessTypeStats: any[];
}

interface BranchState {
  branches: Branch[];
  currentBranch: Branch | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
  stats: Stats | null;
}

const initialState: BranchState = {
  branches: [],
  currentBranch: null,
  loading: false,
  error: null,
  pagination: null,
  stats: null,
};

// Thunks
export const fetchBranches = createAsyncThunk(
  'branches/fetch',
  async (params: {
    page?: number;
    limit?: number;
    search?: string;
    project?: string;
    status?: string;
  } = {}, { rejectWithValue }) => {
    const qp = new URLSearchParams();
    if (params.page) qp.append('page', String(params.page));
    if (params.limit) qp.append('limit', String(params.limit));
    if (params.search) qp.append('search', params.search);
    if (params.project) qp.append('project', params.project);
    if (params.status) qp.append('status', params.status);

    try {
      const res = await fetch(`${API_BASE_URL}/branches`);
      if (!res.ok) throw new Error('Failed to fetch branches');
      const data = await res.json();
      console.log(data);
      
      return {
        data: Array.isArray(data) ? data.map(normalizeBranch) : [],
      };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchBranchById = createAsyncThunk(
  'branches/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/branches/${id}`);
      if (!res.ok) throw new Error('Failed to fetch branch');
      const data = await res.json();
      console.log(data);
      
      return {
        data: normalizeBranch(data),
      };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const createBranch = createAsyncThunk(
  'branches/create',
  async (branchData: Partial<Branch>, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/branches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branchData),
      });
      if (!res.ok) throw new Error('Failed to create branch');
      const data = await res.json();
      return {
        data: normalizeBranch(data),
      };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateBranch = createAsyncThunk(
  'branches/update',
  async ({ id, branchData }: { id: string; branchData: Partial<Branch> }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/branches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branchData),
      });
      if (!res.ok) throw new Error('Failed to update branch');
      const data = await res.json();
      return {
        data: normalizeBranch(data),
      };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteBranch = createAsyncThunk(
  'branches/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/branches/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete branch');
      return { id };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateBranchStatus = createAsyncThunk(
  'branches/updateStatus',
  async ({ id, status }: { id: string; status: 'active' | 'inactive' | 'suspended' }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/branches/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update branch status');
      const data = await res.json();
      return {
        ...data,
        data: normalizeBranch(data.data),
      };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchBranchesByProject = createAsyncThunk(
  'branches/fetchByProject',
  async (project: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/branches/project/${project}`);
      if (!res.ok) throw new Error('Failed to fetch branches by project');
      const data = await res.json();
      return {
        ...data,
        data: data.data.map(normalizeBranch),
      };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchActiveBranches = createAsyncThunk(
  'branches/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/branches/active`);
      if (!res.ok) throw new Error('Failed to fetch active branches');
      const data = await res.json();
      return {
        ...data,
        data: data.data.map(normalizeBranch),
      };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const searchBranches = createAsyncThunk(
  'branches/search',
  async (query: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/branches/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Failed to search branches');
      const data = await res.json();
      return {
        ...data,
        data: data.data.map(normalizeBranch),
      };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchBranchStats = createAsyncThunk(
  'branches/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/branches/stats`);
      if (!res.ok) throw new Error('Failed to fetch branch statistics');
      return res.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const branchSlice = createSlice({
  name: 'branches',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearCurrentBranch: (state) => { state.currentBranch = null; },
    setCurrentBranch: (state, action: PayloadAction<Branch>) => { state.currentBranch = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranches.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchBranches.fulfilled, (s, a) => {
        s.loading = false;
        s.branches = Array.isArray(a.payload.data) ? a.payload.data : [];
      })
      .addCase(fetchBranches.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(fetchBranchById.pending, (s) => { s.loading = true; })
      .addCase(fetchBranchById.fulfilled, (s, a) => {
        s.loading = false;
        s.currentBranch = a.payload.data;
      })
      .addCase(fetchBranchById.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(createBranch.pending, (s) => { s.loading = true; })
      .addCase(createBranch.fulfilled, (s, a) => {
        s.loading = false;
        s.branches.unshift(a.payload.data);
      })
      .addCase(createBranch.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(updateBranch.fulfilled, (s, a) => {
        const idx = s.branches.findIndex(b => b._id === a.payload.data._id);
        if (idx !== -1) s.branches[idx] = a.payload.data;
        if (s.currentBranch?._id === a.payload.data._id) s.currentBranch = a.payload.data;
      })

      .addCase(deleteBranch.fulfilled, (s, a) => {
        s.branches = s.branches.filter(b => b._id !== a.payload.id);
        if (s.currentBranch?._id === a.payload.id) s.currentBranch = null;
      })

      .addCase(updateBranchStatus.fulfilled, (s, a) => {
        const idx = s.branches.findIndex(b => b._id === a.payload.data._id);
        if (idx !== -1) s.branches[idx] = a.payload.data;
        if (s.currentBranch?._id === a.payload.data._id) s.currentBranch = a.payload.data;
      })

      .addCase(fetchBranchesByProject.fulfilled, (s, a) => {
        s.branches = Array.isArray(a.payload.data) ? a.payload.data : [];
      })

      .addCase(fetchActiveBranches.fulfilled, (s, a) => {
        s.branches = Array.isArray(a.payload.data) ? a.payload.data : [];
      })

      .addCase(searchBranches.fulfilled, (s, a) => {
        s.branches = Array.isArray(a.payload.data) ? a.payload.data : [];
      })

      .addCase(fetchBranchStats.fulfilled, (s, a) => {
        s.stats = a.payload.data;
      });
  },
});

export const { clearError, clearCurrentBranch, setCurrentBranch } = branchSlice.actions;
export default branchSlice.reducer;