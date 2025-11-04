import React, { useEffect, useMemo, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import { AuthContext } from '../App';
import { FilterIcon, PlusIcon, RefreshIcon } from '../components/Icon';
import { useToasts } from '../components/Toast';
import { fetchSupplyChainItems } from '../src/store/slices/supplyChainItemsSlice';
import { fetchBranches } from '../src/store/slices/branchSlice';
import { 
  fetchSupplyMovements as fetchSupplyMovementsAction,
  importSupplyMovements as importSupplyMovementsAction,
  deleteSupplyMovement,
  createSupplyMovement,
  createSupplyInMovement,
  createSupplyOutMovement
} from '../src/store/slices/supplyMovementsSlice';
import type { RootState, AppDispatch } from '../src/store';
import { SupplyMovement, Supply, Branch, Permission, Role, SupplyChainItem } from '../types';
import SupplyMovementModal from '../components/SupplyMovementModal';

type MovementDisplay = {
  id: string;
  supplyName: string;
  branchName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  date: string;
  reason?: string;
};

interface SupplyMovementsPageProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const SupplyMovementsPage: React.FC<SupplyMovementsPageProps> = ({ activeView, setActiveView }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useContext(AuthContext);
  const { addToast } = useToasts();

  const movements = useSelector((state: RootState) => state.supplyMovements.movements);
  const movementsLoading = useSelector((state: RootState) => state.supplyMovements.loading);
  const movementsError = useSelector((state: RootState) => state.supplyMovements.error);

  const inventoryLoading = useSelector((state: RootState) => state.supplyInventory.loading);
  const inventoryError = useSelector((state: RootState) => state.supplyInventory.error);

  const supplies = useSelector((state: RootState) => state.supplyChainItems.items) as SupplyChainItem[];
  const branches = useSelector((state: RootState) => state.branches.branches) as Branch[];

  const branchLoading = useSelector((state: RootState) => state.branches.loading);
  const branchError = useSelector((state: RootState) => state.branches.error);

  const [filterText, setFilterText] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  useEffect(() => {
    dispatch(fetchSupplyMovementsAction());
    dispatch(fetchSupplyChainItems({ page: 1, limit: 1000 }));
    dispatch(fetchBranches({}));
  }, [dispatch]);

  const supplyLookup = useMemo(() => {
    const map = new Map<string, string>();
    if (Array.isArray(supplies)) {
      supplies.forEach((s) => {
        if (s && s._id && s.productName) {
          map.set(String(s._id), s.productName);
        }
      });
    }
    return map;
  }, [supplies]);

  const branchLookup = useMemo(() => {
    const map = new Map<string, string>();
    if (Array.isArray(branches)) {
      branches.forEach((b) => {
        if (b && b._id) {
          const id = String(b._id);
          const name = b.name ?? 'غير معروف';
          map.set(id, name);
        }
      });
    }
    return map;
  }, [branches]);

  const displayMovements = useMemo<MovementDisplay[]>(() => {
    if (!Array.isArray(movements) || movements.length === 0) {
      return [];
    }
    return movements
      .filter((m) => {
        if (!m) return false;
        const movementType = m.movementType || (m as any).type;
        return movementType === 'IN' || movementType === 'OUT';
      })
      .map((m) => ({
        id: m._id as string,
        // استخدام اسم المنتج المخزن مباشرة في البيانات إذا كان متاحًا
        supplyName: (m as any).productName || supplyLookup.get(String(m.supplyId || (m as any).productId)) || 'غير معروف',
        // استخدام اسم الفرع المخزن مباشرة في البيانات إذا كان متاحًا
        branchName: (m as any).branchName || branchLookup.get(String((m as any).toBranch || (m as any).branchId)) || 'غير معروف',
        type: (m.movementType || (m as any).type) as 'IN' | 'OUT',
        quantity: m.quantity,
        date: new Date(m.createdAt || (m as any).date).toLocaleDateString('ar-EG', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        reason: (m as any).notes || (m as any).reason || undefined,
      }));
  }, [movements, supplyLookup, branchLookup]);

  const filteredMovements = useMemo(() => {
    return displayMovements.filter((m) => {
      const matchesText =
        !filterText ||
        m.supplyName.toLowerCase().includes(filterText.toLowerCase()) ||
        (m.reason && m.reason.toLowerCase().includes(filterText.toLowerCase()));
      const matchesBranch = !selectedBranchId || m.branchName === branchLookup.get(selectedBranchId);
      const matchesType = selectedType === 'ALL' || m.type === selectedType;
      return matchesText && matchesBranch && matchesType;
    });
  }, [displayMovements, filterText, selectedBranchId, selectedType, branchLookup]);

  const hasPermission = (perm: 'create' | 'read' | 'delete'): boolean => {
    if (user.role === Role.SuperAdmin) return true;
    return !!user?.permissions?.some((p: Permission) => p === `movements:${perm}`);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الحركة؟')) return;
    dispatch(deleteSupplyMovement(id))
      .unwrap()
      .then(() => addToast('تم حذف الحركة', 'success'))
      .catch((err) => addToast(err.message || 'فشل الحذف', 'error'));
  };
  
  const handleSave = async (data: Omit<SupplyMovement, 'id' | 'date'>) => {
    try {
      // Validate required fields
      if (!data.supplyId) {
        throw new Error('يجب تحديد المادة');
      }
      if (!data.branchId || data.branchId === 'undefined') {
        throw new Error('يجب تحديد الفرع');
      }
      
      // Prepare API data with required fields
      const apiData = {
        ...data,
        date: new Date().toISOString(), // Add required date field
        createdBy: user!.id
      };
      
      // Convert type to IN/OUT for API compatibility
      const movementType = apiData.type === 'TRANSFER' || apiData.type === 'ADJUSTMENT' ? 'IN' : apiData.type;
      const finalData = { ...apiData, type: movementType };
      
      // Use the appropriate action based on movement type
      if (movementType === 'IN') {
        await dispatch(createSupplyInMovement(finalData)).unwrap();
      } else {
        await dispatch(createSupplyOutMovement(finalData)).unwrap();
      }
      
      addToast('تمت إضافة الحركة بنجاح', 'success');
      setModalOpen(false);
      
      // Refresh the movements list
      dispatch(fetchSupplyMovementsAction());
    } catch (e: any) {
      addToast(e?.message ?? 'فشل في إضافة الحركة', 'error');
    }
  };
  
  const handleImport = async () => {
    if (!importFile) {
      addToast('يرجى اختيار ملف للتحميل', 'error');
      return;
    }
    try {
      const data = await parseExcelFile(importFile);
      await dispatch(importSupplyMovementsAction(data));
      addToast(`تم استيراد ${data.length} حركة بنجاح`, 'success');
      setImportFile(null);
    } catch (error: any) {
      addToast(error?.message || 'فشل في استيراد البيانات', 'error');
    }
  };

 const parseExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const binaryStr = event.target.result;
          const workbook = XLSX.read(binaryStr, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          resolve(json);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsBinaryString(file);
    });
  };
  
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const loading = branchLoading || movementsLoading;
  const error = branchError ?? movementsError;

  return (
    <div className="glass-pane" style={{ padding: '1rem 1.5rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <h3 style={{ fontSize: isMobile ? '1rem' : '1.25rem', fontWeight: 600 }}>
          حركات المواد
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {hasPermission('create') && (
            <>
              <button
                onClick={() => setModalOpen(true)}
                className="btn btn-primary"
                style={{
                fontSize: isMobile ? '0.875rem' : '1rem',
                padding: isMobile ? '0.5rem 0.75rem' : undefined,
                }}
              >
                <PlusIcon style={{ width: 16, height: 16, marginLeft: '0.25rem' }} />
                {isMobile ? 'إضافة' : 'إضافة حركة'}
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="file" 
                  accept=".xlsx,.xls,.csv" 
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  style={{ fontSize: '0.875rem' }}
                />
                <button
                  onClick={handleImport}
                  className="btn btn-secondary"
                  disabled={!importFile}
                  style={{ fontSize: '0.875rem', padding: '0.5rem' }}
                >
                  استيراد
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '0.5rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 200 }}>
          <FilterIcon style={{ width: 16, height: 16, marginLeft: '0.5rem' }} />
          <input
            type="text"
            placeholder="بحث بالمادة أو السبب..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '0.25rem',
              border: '1px solid #e5e7eb',
              fontSize: isMobile ? '0.875rem' : '1rem',
            }}
          />
        </div>

        <select
          value={selectedBranchId ?? ''}
          onChange={(e) => setSelectedBranchId(e.target.value || null)}
          style={{
            padding: '0.5rem',
            borderRadius: '0.25rem',
            border: '1px solid #e5e7eb',
            minWidth: 150,
            fontSize: isMobile ? '0.875rem' : '1rem',
          }}
        >
          <option value="">جميع الفروع</option>
          {branches && Array.isArray(branches) && branches.length > 0 ? (
            branches.map((b, index) => {
              const id = b._id || b.id;
              const key = id && id !== 'undefined' ? id : `branch-${index}`;
              return (
                <option key={key} value={id}>
                  {b.name}
                </option>
              );
            })
          ) : (
            <option disabled>لا توجد فروع</option>
          )}
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as any)}
          style={{
            padding: '0.5rem',
            borderRadius: '0.25rem',
            border: '1px solid #e5e7eb',
            minWidth: 120,
            fontSize: isMobile ? '0.875rem' : '1rem',
          }}
        >
          <option value="ALL">جميع الحركات</option>
          <option value="IN">وارد</option>
          <option value="OUT">صادر</option>
        </select>

        <button
          onClick={() => {
            setFilterText('');
            setSelectedBranchId(null);
            setSelectedType('ALL');
          }}
          className="btn btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: isMobile ? '0.875rem' : '1rem',
            padding: isMobile ? '0.5rem' : undefined,
          }}
        >
          <RefreshIcon style={{ width: 16, height: 16, marginLeft: '0.25rem' }} />
          {isMobile ? 'إعادة' : 'إعادة تعيين'}
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: '1rem', color: '#ef4444', fontWeight: 500 }}>
          {error}
        </div>
      )}
      
      {(!branches || !Array.isArray(branches) || branches.length === 0) && !branchLoading ? (
        <div style={{ marginBottom: '1rem', color: '#f59e0b', fontWeight: 500 }}>
          تحذير: لم يتم تحميل الفروع. يرجى التأكد من اتصال الخادم.
        </div>
      ) : null}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', fontWeight: 600 }}>
          جاري التحميل...
        </div>
      ) : (
        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: isMobile ? 700 : '100%' }}>
            <thead>
              <tr>
                <th>المادة</th>
                {!isMobile && <th>الفرع</th>}
                <th>النوع</th>
                <th>الكمية</th>
                <th>التاريخ</th>
                {!isMobile && <th>السبب</th>}
                {hasPermission('delete') && <th>إجراءات</th>}
              </tr>
            </thead>
            <tbody>
              {filteredMovements.length ? (
                filteredMovements.map((m) => (
                  <tr key={m.id}>
                    <td>{m.supplyName}</td>
                    {!isMobile && <td>{m.branchName}</td>}
                    <td>
                      <span
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          backgroundColor: m.type === 'IN' ? '#d1fae5' : '#fee2e2',
                          color: m.type === 'IN' ? '#065f46' : '#991b1b',
                          fontWeight: 500,
                        }}
                      >
                        {m.type === 'IN' ? 'وارد' : 'صادر'}
                      </span>
                    </td>
                    <td>{m.quantity}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{m.date}</td>
                    {!isMobile && <td>{m.reason || '-'}</td>}
                    {hasPermission('delete') && (
                      <td>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="btn btn-ghost"
                          style={{ color: '#ef4444', padding: '0.25rem 0.5rem' }}
                        >
                          حذف
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={hasPermission('delete') ? (isMobile ? 5 : 7) : (isMobile ? 4 : 6)}
                    style={{
                      textAlign: 'center',
                      padding: '2rem',
                      color: '#6b7280',
                    }}
                  >
                    لا توجد حركات مطابقة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {modalOpen && (
        <SupplyMovementModal
            onClose={() => setModalOpen(false)}
            onSave={handleSave}
            supplies={supplies}
            branches={branches}
        />
      )}
    </div>
  );
};

export default SupplyMovementsPage;
