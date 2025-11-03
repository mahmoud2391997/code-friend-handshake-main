import React, { useEffect, useState } from 'react';
import { PlusIcon } from '../components/Icon';
import StockMovementModal from '../components/StockMovementModal';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { fetchStockMovements } from '../src/store/slices/stockMovementsSlice';
import { fetchProducts } from '../src/store/slices/productsSlice';
import { fetchBranches } from '../src/store/slices/branchSlice';

const StockMovements: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: movements } = useAppSelector(s => s.stockMovements);
  const products = useAppSelector(s => s.products.items);
  const branches = useAppSelector(s => s.branches.branches);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock current user - in real app this would come from auth context
  const currentUser = { id: '1', branchId: '1' };

  useEffect(() => {
    dispatch(fetchStockMovements());
    dispatch(fetchProducts());
    dispatch(fetchBranches({ page: 1, limit: 100 }));
  }, [dispatch]);

  const getMovementTypeText = (type: string) => {
    switch (type) {
      case 'IN': return 'إضافة';
      case 'OUT': return 'خصم';
      case 'TRANSFER': return 'تحويل';
      case 'ADJUSTMENT': return 'تعديل';
      default: return type;
    }
  };

  const getReferenceTypeText = (type: string) => {
    switch (type) {
      case 'MANUAL': return 'إدخال يدوي';
      case 'PURCHASE': return 'مشتريات';
      case 'SALE': return 'مبيعات';
      case 'TRANSFER': return 'تحويل';
      case 'ADJUSTMENT': return 'تعديل';
      default: return type;
    }
  };

  return (
    <>
      <div className="glass-pane">
        <div className="page-header">
          <h3>حركات المخزون</h3>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <PlusIcon style={{ width: '20px', height: '20px' }} />
            تسجيل حركة جديدة
          </button>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>المنتج</th>
                <th>الفرع</th>
                <th>نوع الحركة</th>
                <th>الكمية</th>
                <th>نوع المرجع</th>
                <th>الملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {movements.map(movement => {
                const product = products.find(p => String(p.id || p._id) === String(movement.productId));
                const branch = branches.find(b => String(b.id || b._id) === String(movement.branchId));
                
                return (
                  <tr key={movement._id || movement.id}>
                    <td>{new Date(movement.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td>{product?.name || 'غير محدد'}</td>
                    <td>{branch?.name || 'غير محدد'}</td>
                    <td>
                      <span className={`badge ${movement.movementType === 'IN' ? 'badge-success' : 'badge-warning'}`}>
                        {getMovementTypeText(movement.movementType)}
                      </span>
                    </td>
                    <td>{movement.quantity}</td>
                    <td>{getReferenceTypeText(movement.referenceType)}</td>
                    <td>{movement.notes || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <StockMovementModal
          onClose={() => setIsModalOpen(false)}
          products={products}
          branches={branches}
          currentUser={currentUser}
        />
      )}
    </>
  );
};

export default StockMovements;