import React, { useState, useEffect } from 'react';
import { InventoryVoucher, Branch, Customer, Supplier } from '../types';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { fetchBranches } from '../src/store/slices/branchSlice';
import { fetchCustomers } from '../src/store/slices/customersSlice';
import { list as fetchSuppliers } from '../src/store/slices/supplierSlice';

interface VoucherModalProps {
    onClose: () => void;
    onSave: (voucher: InventoryVoucher) => void;
    initialVoucher?: Partial<InventoryVoucher>;
    readOnly?: boolean;
}

interface Warehouse {
    id: string;
    name: string;
    branchId?: string;
}

const VoucherModal: React.FC<VoucherModalProps> = ({ onClose, onSave, initialVoucher, readOnly }) => {
    const dispatch = useAppDispatch();
    const branches = useAppSelector(s => s.branches.branches);
    const customers = useAppSelector(s => s.customers.items);
    const suppliers = useAppSelector(s => s.suppliers.items);
    
    // Mock warehouses - in real app, fetch from backend
    const warehouses: Warehouse[] = [
        { id: '1', name: 'المستودع الرئيسي', branchId: '1' },
        { id: '2', name: 'مستودع الفرع الثاني', branchId: '2' },
        { id: '3', name: 'مستودع المواد الخام', branchId: '1' }
    ];
    
    useEffect(() => {
        if (!branches?.length) dispatch(fetchBranches({ page: 1, limit: 100 }));
        if (!customers?.length) dispatch(fetchCustomers());
        if (!suppliers?.length) dispatch(fetchSuppliers());
    }, [dispatch, branches?.length, customers?.length, suppliers?.length]);
    const [voucher, setVoucher] = useState<Partial<InventoryVoucher>>({
        id: String(Math.floor(Math.random() * 90000) + 10000),
        date: new Date().toISOString().split('T')[0],
        status: 'تمت الموافقة',
        description: '',
        details: '',
        createdBy: 'المستخدم الحالي',
        branchId: '',
        type: 'up',
        source: 'manual',
        warehouseId: '',
        customerId: '',
        supplierId: '',
        referenceId: '',
        ...initialVoucher
    });

    const handleFieldChange = (field: keyof InventoryVoucher, value: any) => {
        setVoucher(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveClick = () => {
        if (!voucher.description || !voucher.details || !voucher.branchId) {
            alert('يرجى ملء جميع الحقول المطلوبة (الوصف، التفاصيل، الفرع)');
            return;
        }
        console.log('Saving voucher:', voucher);
        onSave(voucher as InventoryVoucher);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{ maxWidth: '50rem' }}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                        {readOnly ? 'عرض السند' : initialVoucher ? 'تعديل السند' : 'إضافة سند جديد'}
                    </h2>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {!readOnly && (
                            <button onClick={handleSaveClick} className="btn btn-secondary">حفظ</button>
                        )}
                        <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
                    </div>
                </div>
                <div className="modal-body">
                    <div className="form-section">
                        <div className="form-section-header">معلومات السند</div>
                        <div className="form-section-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label className="form-label required">رقم السند</label>
                                <input type="text" value={voucher.id} className="form-input" disabled />
                            </div>
                            <div>
                                <label className="form-label required">التاريخ</label>
                                <input 
                                    type="date" 
                                    value={voucher.date} 
                                    onChange={e => handleFieldChange('date', e.target.value)} 
                                    className="form-input" 
                                    disabled={!!readOnly} 
                                />
                            </div>
                            <div>
                                <label className="form-label required">الحالة</label>
                                <select 
                                    value={voucher.status} 
                                    onChange={e => handleFieldChange('status', e.target.value)} 
                                    className="form-select" 
                                    disabled={!!readOnly}
                                >
                                    <option value="تمت الموافقة">تمت الموافقة</option>
                                    <option value="قيد المراجعة">قيد المراجعة</option>
                                    <option value="مرفوض">مرفوض</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label required">النوع</label>
                                <select 
                                    value={voucher.type} 
                                    onChange={e => handleFieldChange('type', e.target.value)} 
                                    className="form-select" 
                                    disabled={!!readOnly}
                                >
                                    <option value="up">إضافة</option>
                                    <option value="down">خصم</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">مصدر الإذن</label>
                                <select 
                                    value={voucher.source || 'manual'} 
                                    onChange={e => handleFieldChange('source', e.target.value)} 
                                    className="form-select" 
                                    disabled={!!readOnly}
                                >
                                    <option value="manual">✋ يدوي</option>
                                    <option value="system">🤖 تلقائي</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">الرقم المعرف</label>
                                <input 
                                    type="text" 
                                    value={voucher.referenceId || ''} 
                                    onChange={e => handleFieldChange('referenceId', e.target.value)} 
                                    className="form-input" 
                                    disabled={!!readOnly}
                                    placeholder="أدخل الرقم المعرف..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="form-section-header">التفاصيل</div>
                        <div className="form-section-body" style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label className="form-label required">الوصف</label>
                                <input 
                                    type="text" 
                                    value={voucher.description || ''} 
                                    onChange={e => handleFieldChange('description', e.target.value)} 
                                    className="form-input" 
                                    disabled={!!readOnly}
                                    placeholder="وصف مختصر للسند"
                                />
                            </div>
                            <div>
                                <label className="form-label required">التفاصيل</label>
                                <textarea 
                                    value={voucher.details || ''} 
                                    onChange={e => handleFieldChange('details', e.target.value)} 
                                    className="form-input" 
                                    rows={4} 
                                    disabled={!!readOnly}
                                    placeholder="تفاصيل السند والملاحظات"
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label className="form-label">أنشأ بواسطة</label>
                                    <input 
                                        type="text" 
                                        value={voucher.createdBy || ''} 
                                        onChange={e => handleFieldChange('createdBy', e.target.value)} 
                                        className="form-input" 
                                        disabled={!!readOnly}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">الفرع</label>
                                    <select 
                                        value={voucher.branchId || ''} 
                                        onChange={e => handleFieldChange('branchId', e.target.value)} 
                                        className="form-select" 
                                        disabled={!!readOnly}
                                    >
                                        <option value="">🏢 اختر الفرع</option>
                                        {(branches || []).map((b: Branch) => (
                                            <option key={String(b._id || b.id)} value={String(b._id || b.id)}>
                                                🏪 {b.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">المستودع</label>
                                    <select 
                                        value={voucher.warehouseId || ''} 
                                        onChange={e => handleFieldChange('warehouseId', e.target.value)} 
                                        className="form-select" 
                                        disabled={!!readOnly}
                                    >
                                        <option value="">🏭 اختر المستودع</option>
                                        {warehouses.map((w: Warehouse) => (
                                            <option key={w.id} value={w.id}>
                                                🏭 {w.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">العميل</label>
                                    <select 
                                        value={voucher.customerId || ''} 
                                        onChange={e => handleFieldChange('customerId', e.target.value)} 
                                        className="form-select" 
                                        disabled={!!readOnly}
                                    >
                                        <option value="">👥 اختر العميل</option>
                                        {(customers || []).map((c: Customer) => (
                                            <option key={String(c._id || c.id)} value={String(c._id || c.id)}>
                                                👤 {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">المورد</label>
                                    <select 
                                        value={voucher.supplierId || ''} 
                                        onChange={e => handleFieldChange('supplierId', e.target.value)} 
                                        className="form-select" 
                                        disabled={!!readOnly}
                                    >
                                        <option value="">🏢 اختر المورد</option>
                                        {(suppliers || []).map((s: Supplier) => (
                                            <option key={String(s.id)} value={String(s.id)}>
                                                🏢 {s.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoucherModal;