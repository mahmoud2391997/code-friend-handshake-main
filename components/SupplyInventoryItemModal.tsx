import React, { useEffect, useMemo, useState } from 'react';
import { SupplyInventory } from '../types';

interface ModalSupplyOption {
  _id: string;
  name: string;
  sku?: string;
}

interface ModalBranchOption {
  _id: string;
  name: string;
}

interface Props {
  supplies: ModalSupplyOption[];
  branches?: ModalBranchOption[];
  initial?: Partial<SupplyInventory>;
  onClose: () => void;
  onSave: (item: SupplyInventory) => void;
}

const fallbackBranches: ModalBranchOption[] = [];

const SupplyInventoryItemModal: React.FC<Props> = ({ supplies, branches, initial, onClose, onSave }) => {
  const normalizedBranches = branches && branches.length ? branches : fallbackBranches;
  const [supplyId, setSupplyId] = useState(initial?.supplyId ? String(initial.supplyId) : '');
  const [branchId, setBranchId] = useState(initial?.branchId ? String(initial.branchId) : '');
  const [quantity, setQuantity] = useState<number>(initial?.quantity ?? 0);
  const [minStock, setMinStock] = useState<number>(initial?.minStock ?? 0);
  const [reorderPoint, setReorderPoint] = useState<number>(initial?.reorderPoint ?? 0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedSupply = useMemo(
    () => supplies.find((s) => String(s._id) === String(supplyId)),
    [supplies, supplyId]
  );

  useEffect(() => {
    // Clear SKU dependent errors when supply changes
    if (errors['supplyId']) {
      setErrors((e) => ({ ...e, supplyId: '' }));
    }
  }, [supplyId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!supplyId) e.supplyId = 'الرجاء اختيار المادة';
    if (!branchId) e.branchId = 'الرجاء اختيار الفرع';
    if (!(quantity > 0)) e.quantity = 'الكمية مطلوبة وبقيمة صحيحة';
    if (minStock < 0) e.minStock = 'الحد الأدنى لا يمكن أن يكون سالبًا';
    if (reorderPoint < 0) e.reorderPoint = 'نقطة إعادة الطلب لا يمكن أن تكون سالبًا';
    setErrors(e);
    return Object.keys(e).every((k) => !e[k]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      supplyId,
      branchId,
      quantity,
      minStock,
      reorderPoint,
      lastMovementDate: new Date().toISOString().split('T')[0],
    });
  };

  // Derived status (same logic as page)
  const status = useMemo(() => {
    if (quantity <= (minStock || 0)) return { text: 'منخفض', color: '#ef4444' };
    if (reorderPoint && quantity <= reorderPoint) return { text: 'إعادة طلب', color: '#f59e0b' };
    return { text: 'طبيعي', color: '#10b981' };
  }, [quantity, minStock, reorderPoint]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-pane" onClick={(e) => e.stopPropagation()} style={{ width: 600, maxWidth: '95%', borderRadius: '1rem' }}>
        <div className="modal-header" style={{ borderBottom: '1px solid var(--surface-border)', marginBottom: '1rem', paddingBottom: '0.75rem' }}>
          <h2 style={{ margin: 0, fontWeight: 700 }}>إضافة مادة للمخزون</h2>
          <button onClick={onClose} style={{ background: 'var(--surface-bg)', border: '1px solid var(--surface-border)', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer', width: 40, height: 40, borderRadius: '50%' }}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ gridColumn: '1 / span 2' }}>
              <label>المادة</label>
              <select value={supplyId} onChange={e => setSupplyId(e.target.value)} className="form-select-enhanced">
                <option value=''>اختر المادة</option>
                {supplies.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
              {errors.supplyId && <div className="error-message" style={{ color: '#ef4444' }}>{errors.supplyId}</div>}
            </div>

            <div className="form-group">
              <label>الرمز التعريفي</label>
              <input value={selectedSupply?.sku || ''} readOnly className="form-input-enhanced" />
            </div>

            <div className="form-group">
              <label>الفرع</label>
              <select value={branchId} onChange={e => setBranchId(e.target.value)} className="form-select-enhanced">
                <option value=''>اختر الفرع</option>
                {normalizedBranches.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
              {errors.branchId && <div className="error-message" style={{ color: '#ef4444' }}>{errors.branchId}</div>}
            </div>

            <div className="form-group">
              <label>الكمية</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="form-input-enhanced" />
              {errors.quantity && <div className="error-message" style={{ color: '#ef4444' }}>{errors.quantity}</div>}
            </div>

            <div className="form-group">
              <label>الحد الأدنى</label>
              <input type="number" value={minStock} onChange={(e) => setMinStock(Number(e.target.value))} className="form-input-enhanced" />
              {errors.minStock && <div className="error-message" style={{ color: '#ef4444' }}>{errors.minStock}</div>}
            </div>

            <div className="form-group">
              <label>نقطة إعادة الطلب</label>
              <input type="number" value={reorderPoint} onChange={(e) => setReorderPoint(Number(e.target.value))} className="form-input-enhanced" />
              {errors.reorderPoint && <div className="error-message" style={{ color: '#ef4444' }}>{errors.reorderPoint}</div>}
            </div>

            <div className="form-group" style={{ gridColumn: '1 / span 2' }}>
              <label>الحالة</label>
              <div style={{
                color: status.color,
                backgroundColor: `${status.color}20`,
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                display: 'inline-block',
                fontWeight: 500,
              }}>{status.text}</div>
            </div>
          </div>
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>إلغاء</button>
            <button type="submit" className="btn-primary">حفظ</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplyInventoryItemModal;
