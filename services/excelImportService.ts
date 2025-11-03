import * as XLSX from 'xlsx';
import { API_BASE_URL } from '../src/config/api';

/**
 * Validates and converts date strings to timestamps
 * @param dateStr Date string from Excel
 * @param defaultValue Default value to use if date is invalid
 * @returns Timestamp or default value
 */
export const convertDateToTimestamp = (dateStr: string | undefined, defaultValue: string = ''): string => {
  if (!dateStr) return defaultValue;
  
  // Try to parse the date
  const date = new Date(dateStr);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return defaultValue;
  }
  
  return date.toISOString();
};

/**
 * Validates and converts numeric values
 * @param value Value from Excel
 * @param defaultValue Default value to use if value is invalid
 * @returns Validated number or default value
 */
export const validateNumber = (value: any, defaultValue: number = 0): number => {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

/**
 * Validates and converts string values
 * @param value Value from Excel
 * @param defaultValue Default value to use if value is invalid
 * @returns Validated string or default value
 */
export const validateString = (value: any, defaultValue: string = ''): string => {
  if (value === undefined || value === null) return defaultValue;
  return String(value) || defaultValue;
};

/**
 * Generic function to parse Excel file and validate data
 * @param file Excel file to parse
 * @param columnMapping Object mapping expected columns to their validation functions
 * @param requiredColumns Array of column names that are required
 * @returns Parsed and validated data
 */
export const parseExcelFile = async <T>(
  file: File,
  columnMapping: Record<string, (value: any) => any>,
  requiredColumns: string[] = []
): Promise<T[]> => {
  // Read the Excel file
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data, { type: 'array' });
  const wsName = wb.SheetNames[0];
  const ws = wb.Sheets[wsName];
  
  // Convert to JSON with headers
  const rows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });
  
  if (rows.length < 2) {
    throw new Error('File does not contain enough data');
  }
  
  const header = rows[0] as string[];
  const body = rows.slice(1);
  
  // Normalize column names
  const normalizedHeader = header.map(h => h?.trim());
  
  // Validate required columns
  const missingColumns = requiredColumns.filter(
    col => !normalizedHeader.some(h => h === col)
  );
  
  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
  }
  
  // Process rows
  return body
    .filter(row => row && row.length > 0)
    .map(row => {
      const item: Record<string, any> = {};
      
      // Apply validation for each column
      Object.entries(columnMapping).forEach(([columnName, validationFn]) => {
        const colIndex = normalizedHeader.findIndex(h => h === columnName);
        if (colIndex !== -1) {
          item[columnName] = validationFn(row[colIndex]);
        } else {
          // Use validation function to get default value
          item[columnName] = validationFn(undefined);
        }
      });
      
      return item as T;
    });
};

/**
 * Sends validated data to the backend
 * @param endpoint API endpoint
 * @param data Validated data to send
 * @returns Response from the backend
 */
export const sendToBackend = async <T>(endpoint: string, data: T[]): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items: data }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to import data: ${errorText}`);
  }
  
  return response.json();
};

/**
 * Creates a downloadable Excel template
 * @param columns Array of column names
 * @param filename Filename for the template
 */
export const downloadExcelTemplate = (columns: string[], filename: string): void => {
  const ws = XLSX.utils.aoa_to_sheet([columns]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};