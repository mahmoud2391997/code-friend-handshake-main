import React, { useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { importExcelData, resetImportState } from '../src/store/slices/importSlice';
import { useToasts } from './Toast';
import { downloadExcelTemplate } from '../services/excelImportService';

interface ExcelImportButtonProps {
  endpoint: string;
  columnMapping: Record<string, (value: any) => any>;
  requiredColumns: string[];
  templateColumns: string[];
  templateFilename: string;
  onImportSuccess?: (data: any) => void;
  buttonText?: string;
  templateButtonText?: string;
}

const ExcelImportButton: React.FC<ExcelImportButtonProps> = ({
  endpoint,
  columnMapping,
  requiredColumns,
  templateColumns,
  templateFilename,
  onImportSuccess,
  buttonText = 'استيراد من Excel',
  templateButtonText = 'تنزيل القالب'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const { addToast } = useToasts();
  const [isUploading, setIsUploading] = useState(false);
  
  const importState = useAppSelector(state => state.import);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      
      const result = await dispatch(importExcelData({
        file,
        endpoint,
        columnMapping,
        requiredColumns
      })).unwrap();
      
      addToast(`تم استيراد ${result.count} سجل بنجاح`, 'success');
      
      if (onImportSuccess) {
        onImportSuccess(result.data);
      }
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error: any) {
      addToast(error.toString() || 'فشل في استيراد الملف', 'error');
    } finally {
      setIsUploading(false);
      dispatch(resetImportState());
    }
  };

  const handleDownloadTemplate = () => {
    downloadExcelTemplate(templateColumns, templateFilename);
  };

  return (
    <div className="flex gap-2">
      <label className="btn btn-primary">
        {isUploading ? 'جاري الاستيراد...' : buttonText}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>
      <button 
        className="btn btn-secondary"
        onClick={handleDownloadTemplate}
        disabled={isUploading}
      >
        {templateButtonText}
      </button>
    </div>
  );
};

export default ExcelImportButton;