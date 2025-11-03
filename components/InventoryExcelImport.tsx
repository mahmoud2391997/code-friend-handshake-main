import React from 'react';
import ExcelImportButton from './ExcelImportButton';
import { validateNumber, validateString, convertDateToTimestamp } from '../services/excelImportService';
import { useAppDispatch } from '../src/store/hooks';
import { fetchInventory } from '../src/store/slices/inventorySlice';

const InventoryExcelImport: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Define column mapping with validation functions
  const columnMapping = {
    'name': (value: any) => validateString(value, ''),
    'sku': (value: any) => validateString(value, ''),
    'quantity': (value: any) => validateNumber(value, 0),
    'unit': (value: any) => validateString(value, 'قطعة'),
    'costPerUnit': (value: any) => validateNumber(value, 0),
    'minimumStock': (value: any) => validateNumber(value, 0),
    'location': (value: any) => validateString(value, ''),
    'category': (value: any) => validateString(value, 'عام'),
    'supplier': (value: any) => validateString(value, ''),
    'manufactureDate': (value: any) => convertDateToTimestamp(value, ''),
    'expiryDate': (value: any) => convertDateToTimestamp(value, ''),
    'description': (value: any) => validateString(value, '')
  };
  
  // Define required columns
  const requiredColumns = ['name', 'quantity', 'unit'];
  
  // Define template columns for download
  const templateColumns = [
    'name', 'sku', 'quantity', 'unit', 'costPerUnit', 'minimumStock', 
    'location', 'category', 'supplier', 'manufactureDate', 'expiryDate', 'description'
  ];
  
  // Handle successful import
  const handleImportSuccess = () => {
    // Refresh inventory data after successful import
    dispatch(fetchInventory({}));
  };
  
  return (
    <ExcelImportButton
      endpoint="/inventory/import"
      columnMapping={columnMapping}
      requiredColumns={requiredColumns}
      templateColumns={templateColumns}
      templateFilename="inventory_template.xlsx"
      onImportSuccess={handleImportSuccess}
      buttonText="استيراد المخزون"
      templateButtonText="تنزيل قالب المخزون"
    />
  );
};

export default InventoryExcelImport;