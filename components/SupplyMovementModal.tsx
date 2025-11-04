// src/components/SupplyMovementModal.tsx
import React, { useState, useContext } from 'react';
import { Branch, SupplyChainItem, SupplyMovement } from '../types';
import { AuthContext } from '../App';

interface SupplyMovementModalProps {
  onClose: () => void;
  onSave: (movement: Omit<SupplyMovement, 'id' | 'date'>) => void;
  supplies: SupplyChainItem[];
  branches: Branch[];
  initialData?: Partial<ModalFormData>;
}

const getIdentifier = (item: SupplyChainItem | Branch | null | undefined): string => {
  if (!item) return '';
  const id = (item as any)._id ?? (item as any).id;
  if (!id || id === 'undefined' || id === undefined) return '';
  return String(id);
};

interface ModalFormData {
  supplyId: string;
  branchId: string;
  type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number | '';
  notes?: string;
  referenceType?: '' | 'PURCHASE' | 'PRODUCTION' | 'INVENTORY_ADJUSTMENT' | 'TRANSFER';
  referenceId?: string;
}

const SupplyMovementModal: React.FC<SupplyMovementModalProps> = ({
  onClose,
  onSave,
  supplies,
  branches,
}) => {
  const { user } = useContext(AuthContext);
  const validSupplies = supplies.filter(s => getIdentifier(s) && s.productName);
  const validBranches = branches.filter(b => b && b.name);

  const [formData, setFormData] = useState<ModalFormData>({
    supplyId: validSupplies[0] ? String(validSupplies[0]._id || validSupplies[0].id) : '',
    branchId: validBranches[0] ? String(validBranches[0]._id || validBranches[0].id) : '',
    type: 'IN',
    quantity: '',
    notes: '',
    referenceType: '',
    referenceId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const supplyId = formData.supplyId.trim();
    const branchId = formData.branchId.trim();

    if (!supplyId) {
      newErrors.supplyId = 'المادة مطلوبة';
    } else if (!validSupplies.some(s => String(s._id || s.id) === supplyId)) {
      newErrors.supplyId = 'المادة المحددة غير صالحة';
    }

    if (!branchId || branchId === 'undefined') {
      newErrors.branchId = 'الفرع مطلوب';
    } else if (!validBranches.some(b => String(b._id || b.id) === branchId)) {
      newErrors.branchId = 'الفرع المحدد غير صالح';
    }

    const qty = Number(formData.quantity);
    if (formData.quantity === '' || isNaN(qty) || qty <= 0) {
      newErrors.quantity = 'الكمية يجب أن تكون أكبر من صفر';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    const payload: Omit<SupplyMovement, 'id' | 'date'> = {
      supplyId,
      branchId,
      type: formData.type,
      quantity: qty,
      notes: formData.notes?.trim() ?? '',
      createdBy: user?.id || '1',
      ...(formData.referenceType && { referenceType: formData.referenceType }),
      ...(formData.referenceId && { referenceId: formData.referenceId.trim() }),
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content glass-pane"
        onClick={e => e.stopPropagation()}
        style={{
          width: '700px',
          maxWidth: '95%',
          maxHeight: '95vh',
          overflow: 'auto',
          borderRadius: '1rem',
        }}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            borderBottom: '1px solid var(--surface-border)',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            background: 'linear-gradient(to right, var(--primary-glow-1), var(--primary-glow-2))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
            إضافة حركة مخزون
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'var(--surface-bg)',
              border: '1px solid var(--surface-border)',
              color: 'var(--text-secondary)',
              fontSize: '1.5rem',
              cursor: 'pointer',
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all .2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#ef4444';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--surface-bg)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '2rem' }}>
            {/* Supply + Branch */}
            <div className="form-row" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="supplyId" style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '.5rem', fontSize: '.875rem', display: 'block' }}>
                  المادة *
                </label>
                <select id="supplyId" name="supplyId" value={formData.supplyId} onChange={handleChange} className="form-select-enhanced" style={{ width: '100%' }}>
                  <option value="">اختر المادة...</option>
                  {validSupplies.map((s, index) => {
                    const id = getIdentifier(s);
                    return <option key={id || `supply-${index}`} value={id}>{s.productName} ({s.sku})</option>;
                  })}
                </select>
                {errors.supplyId && <div className="error-message" style={{ color: '#ef4444', fontSize: '.75rem', marginTop: '.25rem' }}>{errors.supplyId}</div>}
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="branchId" style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '.5rem', fontSize: '.875rem', display: 'block' }}>
                  الفرع *
                </label>
                <select id="branchId" name="branchId" value={formData.branchId} onChange={handleChange} className="form-select-enhanced" style={{ width: '100%' }}>
                  <option value="">اختر الفرع...</option>
                  {validBranches.map((b, index) => {
                    const id = String(b._id || b.id);
                    const key = id && id !== 'undefined' ? id : `branch-${index}-${b.name}`;
                    return <option key={key} value={id}>{b.name}</option>;
                  })}
                </select>
                {errors.branchId && <div className="error-message" style={{ color: '#ef4444', fontSize: '.75rem', marginTop: '.25rem' }}>{errors.branchId}</div>}
              </div>
            </div>

            {/* Type + Quantity */}
            <div className="form-row" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="type" style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '.5rem', fontSize: '.875rem', display: 'block' }}>
                  نوع الحركة *
                </label>
                <select id="type" name="type" value={formData.type} onChange={handleChange} className="form-select-enhanced" style={{ width: '100%' }}>
                  <option value="IN">وارد</option>
                  <option value="OUT">صادر</option>
                  <option value="TRANSFER">تحويل</option>
                  <option value="ADJUSTMENT">تعديل</option>
                </select>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="quantity" style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '.5rem', fontSize: '.875rem', display: 'block' }}>
                  الكمية *
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  className="form-input-enhanced"
                  style={{ width: '100%' }}
                />
                {errors.quantity && <div className="error-message" style={{ color: '#ef4444', fontSize: '.75rem', marginTop: '.25rem' }}>{errors.quantity}</div>}
              </div>
            </div>

            {/* Reference */}
            <div style={{
              marginTop: '1.5rem',
              padding: '1.25rem',
              background: 'var(--surface-bg)',
              borderRadius: '.75rem',
              border: '1px solid var(--surface-border)',
              marginBottom: '1.5rem',
              boxShadow: '0 2px 4px var(--surface-shadow)',
            }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                معلومات المرجع (اختياري)
              </h4>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="referenceType" style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: '.5rem', fontSize: '.875rem', display: 'block' }}>
                  نوع المرجع
                </label>
                <select id="referenceType" name="referenceType" value={formData.referenceType ?? ''} onChange={handleChange} className="form-select-enhanced" style={{ width: '100%' }}>
                  <option value="">بدون مرجع</option>
                  <option value="PURCHASE">مشتريات</option>
                  <option value="PRODUCTION">إنتاج</option>
                  <option value="INVENTORY_ADJUSTMENT">تعديل مخزون</option>
                  <option value="TRANSFER">تحويل</option>
                </select>
              </div>

              {formData.referenceType && (
                <div className="form-group">
                  <label htmlFor="referenceId" style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: '.5rem', fontSize: '.875rem', display: 'block' }}>
                    رقم المرجع
                  </label>
                  <input
                    type="text"
                    id="referenceId"
                    name="referenceId"
                    value={formData.referenceId ?? ''}
                    onChange={handleChange}
                    placeholder="مثال: PO-12345"
                    className="form-input-enhanced"
                    style={{ width: '100%' }}
                  />
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="notes" style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '.5rem', fontSize: '.875rem', display: 'block' }}>
                ملاحظات
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes ?? ''}
                onChange={handleChange}
                rows={3}
                placeholder="ملاحظات إضافية (اختياري)"
                className="form-textarea-enhanced"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer" style={{
            justifyContent: 'flex-end',
            gap: '1rem',
            padding: '1.5rem 2rem',
            background: 'var(--surface-bg)',
            borderTop: '1px solid var(--surface-border)',
            marginTop: '2rem',
          }}>
            <button type="button" onClick={onClose} className="btn btn-ghost" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
              إلغاء
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
              حفظ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplyMovementModal;