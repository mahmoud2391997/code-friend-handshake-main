import React, { useEffect, useMemo, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../App';
import { PlusIcon, FilterIcon, RefreshIcon } from '../components/Icon';
import { useToasts } from '../components/Toast';
import { fetchSupplyChainItems } from '../src/store/slices/supplyChainItemsSlice';
import { fetchBranches } from '../src/store/slices/branchSlice';
import { 
  fetchSupplyMovements,
  createSupplyMovement,
  createSupplyInMovement,
  createSupplyOutMovement
} from '../src/store/slices/supplyMovementsSlice';
import type { RootState, AppDispatch } from '../src/store';
import { SupplyMovement, Branch, Permission, Role, SupplyChainItem } from '../types';

interface DistributionRequest {
  id: string;
  materialId: string;
  materialName: string;
  fromBranchId: string;
  fromBranchName: string;
  toBranchId: string;
  toBranchName: string;
  quantity: number;
  status: 'PENDING' | 'APPROVED' | 'TRANSFERRED' | 'CANCELLED';
  requestDate: string;
  notes?: string;
}

interface SupplyDistributionPageProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const SupplyDistributionPage: React.FC<SupplyDistributionPageProps> = ({ activeView, setActiveView }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useContext(AuthContext);
  const { addToast } = useToasts();

  const movements = useSelector((state: RootState) => state.supplyMovements.movements);
  const supplies = useSelector((state: RootState) => state.supplyChainItems.items) as SupplyChainItem[];
  const branches = useSelector((state: RootState) => state.branches.branches) as Branch[];
  const loading = useSelector((state: RootState) => state.supplyMovements.loading);

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'TRANSFERRED' | 'CANCELLED'>('ALL');
  const [filterText, setFilterText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchSupplyMovements());
    dispatch(fetchSupplyChainItems({ page: 1, limit: 1000 }));
    dispatch(fetchBranches({}));
  }, [dispatch]);

  // تحويل حركات النقل إلى طلبات توزيع
  const distributionRequests = useMemo<DistributionRequest[]>(() => {
    if (!Array.isArray(movements)) return [];
    
    return movements
      .filter(m => (m as any).type === 'TRANSFER' || m.movementType === 'TRANSFER')
      .map(m => ({
        id: m._id as string,
        materialId: String(m.supplyId || (m as any).productId),
        materialName: (m as any).productName || supplies.find(s => String(s._id) === String(m.supplyId))?.productName || 'غير معروف',
        fromBranchId: String((m as any).fromBranch || (m as any).branchId),
        fromBranchName: (m as any).fromBranchName || branches.find(b => String(b._id) === String((m as any).fromBranch))?.name || 'غير معروف',
        toBranchId: String((m as any).toBranch || (m as any).targetBranchId),
        toBranchName: (m as any).toBranchName || branches.find(b => String(b._id) === String((m as any).toBranch))?.name || 'غير معروف',
        quantity: m.quantity,
        status: (m as any).status || 'PENDING',
        requestDate: new Date(m.createdAt || (m as any).date).toLocaleDateString('ar-EG'),
        notes: (m as any).notes
      }));
  }, [movements, supplies, branches]);

  const filteredRequests = useMemo(() => {
    return distributionRequests.filter(req => {
      const matchesStatus = filterStatus === 'ALL' || req.status === filterStatus;
      const matchesText = !filterText || 
        req.materialName.toLowerCase().includes(filterText.toLowerCase()) ||
        req.fromBranchName.toLowerCase().includes(filterText.toLowerCase()) ||
        req.toBranchName.toLowerCase().includes(filterText.toLowerCase());
      return matchesStatus && matchesText;
    });
  }, [distributionRequests, filterStatus, filterText]);

  const handleCreateDistribution = async (data: {
    materialId: string;
    fromBranchId: string;
    toBranchId: string;
    quantity: number;
    notes?: string;
  }) => {
    try {
      const transferData = {
        supplyId: data.materialId,
        branchId: data.fromBranchId,
        type: 'TRANSFER' as const,
        quantity: data.quantity,
        notes: data.notes || '',
        createdBy: user!.id,
        date: new Date().toISOString(),
        targetBranchId: data.toBranchId,
        status: 'PENDING'
      };

      await dispatch(createSupplyMovement(transferData)).unwrap();
      addToast('تم إنشاء طلب التوزيع بنجاح', 'success');
      setModalOpen(false);
      dispatch(fetchSupplyMovements());
    } catch (error: any) {
      addToast(error?.message || 'فشل في إنشاء طلب التوزيع', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return { bg: '#fef3c7', color: '#92400e' };
      case 'APPROVED': return { bg: '#dbeafe', color: '#1e40af' };
      case 'TRANSFERRED': return { bg: '#d1fae5', color: '#065f46' };
      case 'CANCELLED': return { bg: '#fee2e2', color: '#991b1b' };
      default: return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'في الانتظار';
      case 'APPROVED': return 'معتمد';
      case 'TRANSFERRED': return 'تم النقل';
      case 'CANCELLED': return 'ملغي';
      default: return status;
    }
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="glass-pane" style={{ padding: '1rem 1.5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: '1rem',
        marginBottom: '1rem',
      }}>
        <h3 style={{ fontSize: isMobile ? '1rem' : '1.25rem', fontWeight: 600 }}>
          التوزيع للمستودعات
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {user?.role === Role.SuperAdmin && (
            <button
              onClick={() => setModalOpen(true)}
              className="btn btn-primary"
              style={{
                fontSize: isMobile ? '0.875rem' : '1rem',
                padding: isMobile ? '0.5rem 0.75rem' : undefined,
              }}
            >
              <PlusIcon style={{ width: 16, height: 16, marginLeft: '0.25rem' }} />
              {isMobile ? 'توزيع' : 'طلب توزيع جديد'}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '0.5rem',
        marginBottom: '1rem',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 200 }}>
          <FilterIcon style={{ width: 16, height: 16, marginLeft: '0.5rem' }} />
          <input
            type="text"
            placeholder="بحث بالمادة أو الفرع..."
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
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          style={{
            padding: '0.5rem',
            borderRadius: '0.25rem',
            border: '1px solid #e5e7eb',
            minWidth: 150,
            fontSize: isMobile ? '0.875rem' : '1rem',
          }}
        >
          <option value="ALL">جميع الحالات</option>
          <option value="PENDING">في الانتظار</option>
          <option value="APPROVED">معتمد</option>
          <option value="TRANSFERRED">تم النقل</option>
          <option value="CANCELLED">ملغي</option>
        </select>

        <button
          onClick={() => {
            setFilterText('');
            setFilterStatus('ALL');
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
                <th>من فرع</th>
                <th>إلى فرع</th>
                <th>الكمية</th>
                <th>الحالة</th>
                <th>تاريخ الطلب</th>
                {!isMobile && <th>ملاحظات</th>}
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length ? (
                filteredRequests.map((request) => {
                  const statusStyle = getStatusColor(request.status);
                  return (
                    <tr key={request.id}>
                      <td style={{ fontWeight: 600 }}>{request.materialName}</td>
                      <td>{request.fromBranchName}</td>
                      <td>{request.toBranchName}</td>
                      <td>{request.quantity} وحدة</td>
                      <td>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                          fontWeight: 500,
                        }}>
                          {getStatusText(request.status)}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{request.requestDate}</td>
                      {!isMobile && (
                        <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {request.notes || '-'}
                        </td>
                      )}
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {request.status === 'PENDING' && (
                            <>
                              <button
                                className="btn btn-ghost"
                                style={{ color: '#1e40af', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              >
                                اعتماد
                              </button>
                              <button
                                className="btn btn-ghost"
                                style={{ color: '#991b1b', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              >
                                إلغاء
                              </button>
                            </>
                          )}
                          {request.status === 'APPROVED' && (
                            <button
                              className="btn btn-ghost"
                              style={{ color: '#065f46', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              تأكيد النقل
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={isMobile ? 7 : 8}
                    style={{
                      textAlign: 'center',
                      padding: '2rem',
                      color: '#6b7280',
                    }}
                  >
                    لا توجد طلبات توزيع
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Distribution Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="glass-pane" style={{
            width: '90%',
            maxWidth: '500px',
            padding: '1.5rem',
            margin: '1rem',
          }}>
            <h3 style={{ marginBottom: '1rem' }}>طلب توزيع جديد</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateDistribution({
                materialId: formData.get('materialId') as string,
                fromBranchId: formData.get('fromBranchId') as string,
                toBranchId: formData.get('toBranchId') as string,
                quantity: Number(formData.get('quantity')),
                notes: formData.get('notes') as string,
              });
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <select
                  name="materialId"
                  required
                  style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #e5e7eb' }}
                >
                  <option value="">اختر المادة</option>
                  {supplies.map(supply => (
                    <option key={supply._id} value={supply._id}>
                      {supply.productName} ({supply.sku})
                    </option>
                  ))}
                </select>

                <select
                  name="fromBranchId"
                  required
                  style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #e5e7eb' }}
                >
                  <option value="">من فرع</option>
                  {branches.map(branch => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name}
                    </option>
                  ))}
                </select>

                <select
                  name="toBranchId"
                  required
                  style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #e5e7eb' }}
                >
                  <option value="">إلى فرع</option>
                  {branches.map(branch => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name}
                    </option>
                  ))}
                </select>

                <input
                  name="quantity"
                  type="number"
                  placeholder="الكمية"
                  min="0.01"
                  step="0.01"
                  required
                  style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #e5e7eb' }}
                />

                <textarea
                  name="notes"
                  placeholder="ملاحظات (اختياري)"
                  style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #e5e7eb', minHeight: '80px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  إنشاء طلب التوزيع
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplyDistributionPage;