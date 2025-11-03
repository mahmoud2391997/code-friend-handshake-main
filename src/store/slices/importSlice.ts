import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { parseExcelFile, sendToBackend } from '../../../services/excelImportService';

interface ImportState {
  loading: boolean;
  success: boolean;
  error: string | null;
  importedCount: number;
}

const initialState: ImportState = {
  loading: false,
  success: false,
  error: null,
  importedCount: 0
};

/**
 * Generic thunk for importing Excel data with validation
 */
export const importExcelData = createAsyncThunk(
  'import/importExcelData',
  async <T>({
    file,
    endpoint,
    columnMapping,
    requiredColumns = []
  }: {
    file: File;
    endpoint: string;
    columnMapping: Record<string, (value: any) => any>;
    requiredColumns?: string[];
  }, { rejectWithValue }) => {
    try {
      // Parse and validate Excel data
      const validatedData = await parseExcelFile<T>(file, columnMapping, requiredColumns);
      
      // Send validated data to backend
      const response = await sendToBackend<T>(endpoint, validatedData);
      
      return {
        data: response.data,
        count: validatedData.length
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to import data');
    }
  }
);

const importSlice = createSlice({
  name: 'import',
  initialState,
  reducers: {
    resetImportState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.importedCount = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(importExcelData.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(importExcelData.fulfilled, (state, action: PayloadAction<{ count: number }>) => {
        state.loading = false;
        state.success = true;
        state.importedCount = action.payload.count;
      })
      .addCase(importExcelData.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string || 'Import failed';
      });
  }
});

export const { resetImportState } = importSlice.actions;
export default importSlice.reducer;