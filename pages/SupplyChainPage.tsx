import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../App';
import { FilterIcon, PencilIcon, PlusIcon, RefreshIcon, TrashIcon } from '../components/Icon';
import { useToasts } from '../components/Toast';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import SupplyChainItemModal, {
  supplyChainStatusOptions,
  supplyChainTransportModeOptions,
} from '../components/SupplyChainItemModal';
import {
  SupplyChainItem,
  SupplyChainStatus,
  SupplyChainTransportMode,
} from '../types';
import {
  fetchSupplyChainItems,
  createSupplyChainItem,
  updateSupplyChainItem,
  deleteSupplyChainItem,
  importItems,
} from '../src/store/slices/supplyChainItemsSlice';
import * as XLSX from 'xlsx';

/* -------------------------------------------------------------------------- */
/*                               Arabic → Enum Maps (Exact Match)               */
/* -------------------------------------------------------------------------- */
const statusMap: Record<string, SupplyChainStatus> = {
  'في النقل': SupplyChainStatus.InTransit,
  'تم التسليم': SupplyChainStatus.Delivered,
  'مخزن': SupplyChainStatus.Stored,
  'منتهي الصلاحية': SupplyChainStatus.Expired,
};

/* -------------------------------------------------------------------------- */
/*                               Safe Date Parser (Excel + DD/MM/YYYY)           */
/* -------------------------------------------------------------------------- */
const parseExcelDate = (raw: any): string | undefined => {
  if (!raw) return undefined;
  const str = String(raw).trim();
  if (!str) return undefined;

  // Excel serial date (e.g. 45321)
  if (!isNaN(Number(str))) {
    const excelDate = Number(str);
    if (excelDate > 0) {
      const utc_days = Math.floor(excelDate - 25569);
      const utc_value = utc_days * 86400000;
      const date = new Date(utc_value);
      return date.toISOString();
    }
  }

  // DD/MM/YYYY format
  const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    const iso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T00:00:00.000Z`;
    const date = new Date(iso);
    return !isNaN(date.getTime()) ? date.toISOString() : undefined;
  }

  // Try direct ISO parse (fallback)
  const date = new Date(str);
  return !isNaN(date.getTime()) ? date.toISOString() : undefined;
};

/* -------------------------------------------------------------------------- */
/*                               Component                                          */
/* -------------------------------------------------------------------------- */
const SupplyChainPage: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { addToast } = useToasts();
  const dispatch = useAppDispatch();

  const items = useAppSelector((s) => s.supplyChainItems.items) || [];
  const loading = useAppSelector((s) => s.supplyChainItems.loading);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SupplyChainItem | null>(null);
  const [filter, setFilter] = useState('');
  const [uploading, setUploading] = useState(false);

  const expectedColumns = useMemo(
    () => [
      'المعرف',
      'رمز_SKU',
      'رمز_GTin',
      'رقم_الدفعة',
      'الرقم_التسلسلي',
      'اسم_المنتج',
      'الكمية',
      'الوحدة',
      'الشركة_المصنعة',
      'بلد_المنشأ',
      'تاريخ_التصنيع',
      'تاريخ_الانتهاء',
      'الحالة_الحالية',
      'وسيلة_النقل',
    ],
    []
  );

  useEffect(() => {
    dispatch(fetchSupplyChainItems(undefined));
  }, [dispatch]);

  const can = (perm: 'create' | 'update' | 'delete') =>
    !!user?.permissions?.includes(`supplies:${perm}`);

  const filtered = useMemo(() => {
    if (!Array.isArray(items)) return [];
    const q = filter.toLowerCase();
    return items.filter(
      (i) =>
        i.productName?.toLowerCase().includes(q) ||
        i.sku?.toLowerCase().includes(q) ||
        i.batchNumber?.toLowerCase().includes(q)
    );
  }, [items, filter]);

  const getStatusLabel = (v?: SupplyChainStatus) =>
    supplyChainStatusOptions.find((o) => o.value === v)?.label ?? v ?? '-';

  const getModeLabel = (v?: SupplyChainTransportMode) =>
    supplyChainTransportModeOptions.find((o) => o.value === v)?.label ?? v ?? '-';

  const formatDate = (d?: string) => {
    if (!d) return '-';
    const date = new Date(d);
    if (!isNaN(date.getTime())) {
      return `${String(date.getDate()).padStart(2, '0')}/${String(
        date.getMonth() + 1
      ).padStart(2, '0')}/${date.getFullYear()}`;
    }
    return d;
  };

  // Modal
  const openAdd = () => {
    setSelectedItem(null);
    setModalOpen(true);
  };
  const openEdit = (it: SupplyChainItem) => {
    setSelectedItem(it);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const saveItem = async (it: SupplyChainItem) => {
    try {
      const id = typeof it.id === 'string' ? parseInt(it.id, 10) : it.id;
      if (!id || id < 0) {
        const { id: _, _id: __, ...payload } = it;
        await dispatch(createSupplyChainItem(payload)).unwrap();
        addToast('تمت الإضافة', 'success');
      } else {
        await dispatch(updateSupplyChainItem({ ...it, id })).unwrap();
        addToast('تم التحديث', 'success');
      }
      closeModal();
    } catch (e: any) {
      addToast(e?.message ?? 'فشل الحفظ', 'error');
    }
  };

  const deleteItem = (rawId: string | number) => {
    const id = typeof rawId === 'string' ? parseInt(rawId, 10) : rawId;
    if (!id || id <= 0) return addToast('معرف غير صالح', 'error');
    if (!window.confirm('تأكيد الحذف؟')) return;
    dispatch(deleteSupplyChainItem(id))
      .unwrap()
      .then(() => addToast('تم الحذف', 'success'))
      .catch(() => addToast('فشل الحذف', 'error'));
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([expectedColumns]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'توريد_المواد_قالب.xlsx');
  };

  /* -------------------------------------------------------------------- */
  /*                         EXCEL IMPORT WITH FULL CASTING                       */
  /* -------------------------------------------------------------------- */
  const uploadExcel = async (file: File) => {
    try {
      setUploading(true);
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const header = rows[0] as string[];
      const data = rows.slice(1);

      const norm = (s: string) => s?.trim();
      const ok = expectedColumns.every((c) =>
        header.some((h) => norm(h) === c)
      );
      if (!ok) {
        addToast('الأعمدة غير مطابقة', 'error');
        return;
      }

      const col = (name: string) =>
        header.findIndex((h) => norm(h) === name);

      // Valid enum values
      const validStatuses = supplyChainStatusOptions.map(o => o.value);
      const validModes = supplyChainTransportModeOptions.map(o => o.value);

      const payload: Omit<
        SupplyChainItem,
        'id' | 'created_at' | 'updated_at'
      >[] = data
        .filter((r) => r?.length)
        .map((r) => {
          const get = (n: string) => r[col(n)] ?? '';

          const rawStatus = String(get('الحالة_الحالية')).trim();
          const rawMode = String(get('وسيلة_النقل')).trim();

          // Status: map Arabic → enum, fallback to undefined
          const mappedStatus = statusMap[rawStatus];
          const currentStatus = mappedStatus && validStatuses.includes(mappedStatus)
            ? mappedStatus
            : undefined;

          // Transport Mode: must be in options
          const transportMode = validModes.includes(rawMode as any)
            ? (rawMode as SupplyChainTransportMode)
            : undefined;

          const productName = String(get('اسم_المنتج')).trim();
          
          return {
            sku: String(get('رمز_SKU')).trim() || undefined,
            gtin: String(get('رمز_GTin')).trim() || undefined,
            batchNumber: String(get('رقم_الدفعة')).trim() || undefined,
            serialNumber: String(get('الرقم_التسلسلي')).trim() || undefined,
            productName: productName || 'منتج جديد', // Ensure productName is never empty
            quantity: Math.max(0, Number(get('الكمية')) || 0),
            unit: String(get('الوحدة')).trim() || undefined,
            manufacturer: String(get('الشركة_Мصنعة')).trim() || undefined,
            originCountry: String(get('بلد_المنشأ')).trim() || undefined,
            manufactureDate: parseExcelDate(get('تاريخ_التصنيع')),
            expiryDate: parseExcelDate(get('تاريخ_الانتهاء')),
            currentStatus,
            transportMode,
          };
        })
        .filter(item => item.productName && item.quantity >= 0); // Additional check for productName

      // Validate that productName is never empty or just whitespace
      const validatedPayload = payload.map(item => ({
        ...item,
        productName: item.productName.trim() || 'منتج جديد' // Final validation before sending
      })).filter(item => item.productName && item.productName.trim()); // Ensure no empty product names

      const result = await dispatch(importItems(validatedPayload)).unwrap();
      addToast(`تم استيراد ${result.length} عنصر`, 'success');
    } catch (e: any) {
      addToast(e?.message ?? 'فشل الاستيراد', 'error');
    } finally {
      setUploading(false);
    }
  };

  const mobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="glass-pane" style={{ padding: '1rem 1.5rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: mobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: mobile ? 'stretch' : 'center',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <h3 style={{ fontSize: mobile ? '1rem' : '1.25rem', fontWeight: 600 }}>
          سلسلة التوريد - المواد
        </h3>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            justifyContent: mobile ? 'flex-start' : 'flex-end',
          }}
        >
          <button
            onClick={openAdd}
            className="btn btn-primary"
            style={{
              fontSize: mobile ? '0.875rem' : '1rem',
              padding: mobile ? '0.5rem 0.75rem' : undefined,
            }}
          >
            <PlusIcon style={{ width: 16, height: 16, marginLeft: '0.25rem' }} />
            {mobile ? 'إضافة' : 'إضافة توريد'}
          </button>

          <label
            className="btn btn-secondary"
            style={{ cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}
          >
            {uploading ? 'جارٍ...' : 'استيراد من إكسل'}
            <input
              type="file"
              accept=".xlsx,.xls"
              hidden
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadExcel(f);
                e.currentTarget.value = '';
              }}
            />
          </label>

          <button className="btn btn-secondary" onClick={downloadTemplate}>
            تنزيل القالب
          </button>
        </div>
      </div>

      {/* Search */}
      <div
        style={{
          display: 'flex',
          flexDirection: mobile ? 'column' : 'row',
          gap: '0.5rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <FilterIcon style={{ width: 16, height: 16, marginLeft: '0.5rem' }} />
          <input
            placeholder="بحث..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.25rem',
              fontSize: mobile ? '0.875rem' : '1rem',
            }}
          />
        </div>
        <button
          onClick={() => setFilter('')}
          className="btn btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: mobile ? '0.875rem' : '1rem',
            padding: mobile ? '0.5rem' : undefined,
          }}
        >
          <RefreshIcon style={{ width: 16, height: 16, marginLeft: '0.25rem' }} />
          {mobile ? 'إعادة' : 'إعادة تعيين'}
        </button>
      </div>

      {/* Loading / Empty */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
          <RefreshIcon style={{ width: 16, height: 16 }} />
          <span>جارٍ التحميل...</span>
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div
          style={{
            padding: '1rem',
            textAlign: 'center',
            color: '#6b7280',
            border: '1px dashed #e5e7eb',
            borderRadius: '0.5rem',
            background: '#fafafa',
          }}
        >
          <div style={{ fontWeight: 600 }}>لا توجد مواد</div>
          <div>استخدم "إضافة توريد" أو "استيراد من إكسل"</div>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: mobile ? 1000 : '100%' }}>
            <thead>
              <tr>
                {mobile ? null : <th>المعرف</th>}
                <th>اسم المنتج</th>
                <th>SKU</th>
                <th>GTin</th>
                <th>دفعة</th>
                <th>تسلسلي</th>
                <th>كمية</th>
                <th>وحدة</th>
                {mobile ? null : (
                  <>
                    <th>مصنّع</th>
                    <th>بلد</th>
                    <th>تصنيع</th>
                    <th>انتهاء</th>
                  </>
                )}
                <th>الحالة</th>
                <th>نقل</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it) => (
                <tr key={it.id || it._id || Math.random()}>
                  {mobile ? null : <td>{it.id}</td>}
                  <td>{it.productName}</td>
                  <td>{it.sku ?? '-'}</td>
                  <td>{it.gtin ?? '-'}</td>
                  <td>{it.batchNumber ?? '-'}</td>
                  <td>{it.serialNumber ?? '-'}</td>
                  <td>{it.quantity}</td>
                  <td>{it.unit ?? '-'}</td>
                  {mobile ? null : (
                    <>
                      <td>{it.manufacturer ?? '-'}</td>
                      <td>{it.originCountry ?? '-'}</td>
                      <td>{formatDate(it.manufactureDate)}</td>
                      <td>{formatDate(it.expiryDate)}</td>
                    </>
                  )}
                  <td>{getStatusLabel(it.currentStatus)}</td>
                  <td>{getModeLabel(it.transportMode)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {can('update') && (
                        <button
                          onClick={() => openEdit(it)}
                          style={{ color: '#f59e0b', background: 'none', border: 'none' }}
                        >
                          <PencilIcon style={{ width: mobile ? 18 : 20, height: mobile ? 18 : 20 }} />
                        </button>
                      )}
                      {can('delete') && (
                        <button
                          onClick={() => deleteItem(it.id)}
                          style={{ color: '#ef4444', background: 'none', border: 'none' }}
                        >
                          <TrashIcon style={{ width: mobile ? 18 : 20, height: mobile ? 18 : 20 }} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Popup Modal */}
      {modalOpen && (
        <SupplyChainItemModal
          item={selectedItem}
          onClose={closeModal}
          onSave={saveItem}
        />
      )}
    </div>
  );
};

export default SupplyChainPage;