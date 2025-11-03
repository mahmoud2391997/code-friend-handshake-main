import React, { useState } from 'react';
import { useAppDispatch } from '../src/store/hooks';
import { createStockMovement } from '../src/store/slices/stockMovementsSlice';

interface StockMovementModalProps {
  onClose: () => void;
  products: any[];
  branches: any[];
  currentUser: any;
}

const StockMovementModal: React.FC<StockMovementModalProps> = ({ onClose, products, branches, currentUser }) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    productId: '',
    branchId: currentUser?.branchId || '',
    movementType: 'IN' as 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT',
    quantity: 0,
    referenceType: 'MANUAL' as 'MANUAL' | 'PURCHASE' | 'SALE' | 'TRANSFER' | 'ADJUSTMENT',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createStockMovement({
        ...formData,
        createdBy: currentUser?.id || 'system'
      })).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to create stock movement:', error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>تسجيل حركة مخزون</h3>
          <button onClick={onClose} className="btn btn-ghost">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>المنتج</label>
            <select 
              value={formData.productId}
              onChange={(e) => setFormData({...formData, productId: e.target.value})}
              required
            >
              <option value="">اختر المنتج</option>
              {products.map(p => (
                <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>الفرع</label>
            <select 
              value={formData.branchId}
              onChange={(e) => setFormData({...formData, branchId: e.target.value})}
              required
            >
              <option value="">اختر الفرع</option>
              {branches.map(b => (
                <option key={b.id || b._id} value={b.id || b._id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>نوع الحركة</label>
            <select 
              value={formData.movementType}
              onChange={(e) => setFormData({...formData, movementType: e.target.value as any})}
              required
            >
              <option value="IN">إضافة</option>
              <option value="OUT">خصم</option>
              <option value="TRANSFER">تحويل</option>
              <option value="ADJUSTMENT">تعديل</option>
            </select>
          </div>

          <div className="form-group">
            <label>الكمية</label>
            <input 
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
              required
              min="1"
            />
          </div>

          <div className="form-group">
            <label>نوع المرجع</label>
            <select 
              value={formData.referenceType}
              onChange={(e) => setFormData({...formData, referenceType: e.target.value as any})}
              required
            >
              <option value="MANUAL">إدخال يدوي</option>
              <option value="PURCHASE">مشتريات</option>
              <option value="SALE">مبيعات</option>
              <option value="TRANSFER">تحويل</option>
              <option value="ADJUSTMENT">تعديل</option>
            </select>
          </div>

          <div className="form-group">
            <label>الملاحظات</label>
            <textarea 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">إلغاء</button>
            <button type="submit" className="btn btn-primary">حفظ</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockMovementModal;