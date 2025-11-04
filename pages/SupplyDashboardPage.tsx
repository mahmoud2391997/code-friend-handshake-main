import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSupplyOrders } from '../src/store/slices/supplyOrdersSlice';
import { fetchSupplyMovements } from '../src/store/slices/supplyMovementsSlice';
import { fetchSupplySuppliers } from '../src/store/slices/supplySuppliersSlice';
import { fetchSupplyChainItems } from '../src/store/slices/supplyChainItemsSlice';
import type { RootState, AppDispatch } from '../src/store';

interface SupplyDashboardPageProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const SupplyDashboardPage: React.FC<SupplyDashboardPageProps> = ({ activeView, setActiveView }) => {
  const dispatch = useDispatch<AppDispatch>();

  const orders = useSelector((state: RootState) => state.supplyOrders?.orders || []);
  const movements = useSelector((state: RootState) => state.supplyMovements?.movements || []);
  const suppliers = useSelector((state: RootState) => state.supplySuppliers?.suppliers || []);
  const materials = useSelector((state: RootState) => state.supplyChainItems?.items || []);

  useEffect(() => {
    dispatch(fetchSupplyOrders());
    dispatch(fetchSupplyMovements());
    dispatch(fetchSupplySuppliers());
    dispatch(fetchSupplyChainItems({ page: 1, limit: 1000 }));
  }, [dispatch]);

  const stats = useMemo(() => {
    const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
    const activeSuppliers = suppliers.filter(s => s.status === 'ACTIVE').length;
    const recentMovements = movements.filter(m => {
      const moveDate = new Date(m.createdAt || m.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return moveDate >= weekAgo;
    }).length;
    const totalMaterials = materials.length;

    return {
      pendingOrders,
      activeSuppliers,
      recentMovements,
      totalMaterials
    };
  }, [orders, suppliers, movements, materials]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="glass-pane" style={{ padding: '1rem 1.5rem' }}>
      <h3 style={{ fontSize: isMobile ? '1rem' : '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
        لوحة تحكم سلسلة التوريد
      </h3>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="glass-pane" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {stats.pendingOrders}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            طلبات في الانتظار
          </div>
        </div>

        <div className="glass-pane" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
            {stats.activeSuppliers}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            موردين نشطين
          </div>
        </div>

        <div className="glass-pane" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {stats.recentMovements}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            حركات هذا الأسبوع
          </div>
        </div>

        <div className="glass-pane" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
            {stats.totalMaterials}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            إجمالي المواد
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="glass-pane" style={{ padding: '1.5rem' }}>
          <h4 style={{ marginBottom: '1rem', fontWeight: 600 }}>إجراءات سريعة</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveView('Supplies/Orders')}
              className="btn btn-primary"
              style={{ justifyContent: 'flex-start' }}
            >
              إدارة طلبات التوريد
            </button>
            <button
              onClick={() => setActiveView('Supplies/Movements')}
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start' }}
            >
              تسجيل حركة مواد
            </button>
            <button
              onClick={() => setActiveView('Supplies/Suppliers')}
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start' }}
            >
              إدارة الموردين
            </button>
          </div>
        </div>

        <div className="glass-pane" style={{ padding: '1.5rem' }}>
          <h4 style={{ marginBottom: '1rem', fontWeight: 600 }}>الطلبات الأخيرة</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {orders.slice(0, 3).map(order => (
              <div
                key={order.id}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  fontSize: '0.875rem'
                }}
              >
                <div style={{ fontWeight: 600 }}>{order.orderNumber}</div>
                <div style={{ color: '#6b7280' }}>{order.supplierName}</div>
              </div>
            ))}
            {orders.length === 0 && (
              <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                لا توجد طلبات
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-pane" style={{ padding: '1.5rem' }}>
        <h4 style={{ marginBottom: '1rem', fontWeight: 600 }}>النشاط الأخير</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {movements.slice(0, 5).map(movement => (
            <div
              key={movement.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                borderRadius: '0.25rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {(movement as any).productName || 'مادة غير معروفة'}
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                  {movement.quantity} وحدة - {(movement as any).branchName || 'فرع غير معروف'}
                </div>
              </div>
              <span
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  backgroundColor: (movement as any).type === 'IN' ? '#d1fae5' : '#fee2e2',
                  color: (movement as any).type === 'IN' ? '#065f46' : '#991b1b',
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}
              >
                {(movement as any).type === 'IN' ? 'وارد' : 'صادر'}
              </span>
            </div>
          ))}
          {movements.length === 0 && (
            <div style={{ color: '#6b7280', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>
              لا توجد حركات حديثة
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplyDashboardPage;