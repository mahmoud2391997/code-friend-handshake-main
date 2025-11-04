import React, { useEffect, useMemo, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../App';
import { PlusIcon, FilterIcon, RefreshIcon } from '../components/Icon';
import { useToasts } from '../components/Toast';
import { fetchSupplyOrders, createSupplyOrder, updateSupplyOrderStatus } from '../src/store/slices/supplyOrdersSlice';
import { fetchSupplyChainItems } from '../src/store/slices/supplyChainItemsSlice';
import type { RootState, AppDispatch } from '../src/store';
import { Role } from '../types';

interface SupplyOrdersPageProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const SupplyOrdersPage: React.FC<SupplyOrdersPageProps> = ({ activeView, setActiveView }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useContext(AuthContext);
  const { addToast } = useToasts();

  const orders = useSelector((state: RootState) => state.supplyOrders?.orders || []);
  const loading = useSelector((state: RootState) => state.supplyOrders?.loading || false);
  const error = useSelector((state: RootState) => state.supplyOrders?.error);

  const supplies = useSelector((state: RootState) => state.supplyChainItems?.items || []);
  const suppliers = useSelector((state: RootState) => state.supplySuppliers?.suppliers || []);

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'RECEIVED' | 'CANCELLED'>('ALL');
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    dispatch(fetchSupplyOrders());
    dispatch(fetchSupplyChainItems({ page: 1, limit: 1000 }));
  }, [dispatch]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
      const matchesText = !filterText || 
        order.orderNumber.toLowerCase().includes(filterText.toLowerCase()) ||
        order.supplierName.toLowerCase().includes(filterText.toLowerCase());
      return matchesStatus && matchesText;
    });
  }, [orders, filterStatus, filterText]);

  const handleStatusUpdate = (orderId: string, newStatus: any) => {
    dispatch(updateSupplyOrderStatus({ id: orderId, status: newStatus }))
      .unwrap()
      .then(() => addToast('تم تحديث حالة الطلب', 'success'))
      .catch((err) => addToast(err || 'فشل في تحديث الحالة', 'error'));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return { bg: '#fef3c7', color: '#92400e' };
      case 'APPROVED': return { bg: '#dbeafe', color: '#1e40af' };
      case 'RECEIVED': return { bg: '#d1fae5', color: '#065f46' };
      case 'CANCELLED': return { bg: '#fee2e2', color: '#991b1b' };
      default: return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'في الانتظار';
      case 'APPROVED': return 'معتمد';
      case 'RECEIVED': return 'مستلم';
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
          طلبات التوريد
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {user?.role === Role.SuperAdmin && (
            <button
              onClick={() => setActiveView('Supplies/Orders/New')}
              className="btn btn-primary"
              style={{
                fontSize: isMobile ? '0.875rem' : '1rem',
                padding: isMobile ? '0.5rem 0.75rem' : undefined,
              }}
            >
              <PlusIcon style={{ width: 16, height: 16, marginLeft: '0.25rem' }} />
              {isMobile ? 'إضافة' : 'طلب جديد'}
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
            placeholder="بحث برقم الطلب أو المورد..."
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
          <option value="RECEIVED">مستلم</option>
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

      {error && (
        <div style={{ marginBottom: '1rem', color: '#ef4444', fontWeight: 500 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', fontWeight: 600 }}>
          جاري التحميل...
        </div>
      ) : (
        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: isMobile ? 700 : '100%' }}>
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>المورد</th>
                <th>المبلغ الإجمالي</th>
                <th>الحالة</th>
                <th>تاريخ الطلب</th>
                {!isMobile && <th>التسليم المتوقع</th>}
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length ? (
                filteredOrders.map((order) => {
                  const statusStyle = getStatusColor(order.status);
                  return (
                    <tr key={order.id || order._id}>
                      <td style={{ fontWeight: 600 }}>{order.orderNumber}</td>
                      <td>{order.supplierName}</td>
                      <td>{order.totalAmount.toLocaleString()} ر.س</td>
                      <td>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                          fontWeight: 500,
                        }}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {new Date(order.orderDate).toLocaleDateString('ar-EG')}
                      </td>
                      {!isMobile && (
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {order.expectedDelivery ? 
                            new Date(order.expectedDelivery).toLocaleDateString('ar-EG') : 
                            '-'
                          }
                        </td>
                      )}
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {order.status === 'PENDING' && (
                            <button
                              onClick={() => handleStatusUpdate(order.id || order._id!, 'APPROVED')}
                              className="btn btn-ghost"
                              style={{ color: '#1e40af', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              اعتماد
                            </button>
                          )}
                          {order.status === 'APPROVED' && (
                            <button
                              onClick={() => handleStatusUpdate(order.id || order._id!, 'RECEIVED')}
                              className="btn btn-ghost"
                              style={{ color: '#065f46', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              استلام
                            </button>
                          )}
                          {(order.status === 'PENDING' || order.status === 'APPROVED') && (
                            <button
                              onClick={() => handleStatusUpdate(order.id || order._id!, 'CANCELLED')}
                              className="btn btn-ghost"
                              style={{ color: '#991b1b', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              إلغاء
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
                    colSpan={isMobile ? 6 : 7}
                    style={{
                      textAlign: 'center',
                      padding: '2rem',
                      color: '#6b7280',
                    }}
                  >
                    لا توجد طلبات مطابقة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SupplyOrdersPage;