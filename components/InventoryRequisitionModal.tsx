import React, { useEffect, useMemo, useState } from 'react';
import { InventoryRequisition, InventoryRequisitionItem, Product, Branch } from '../types';
import { PlusIcon, TrashIcon, UploadIcon } from './Icon';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { fetchSupplyChainItems } from '../src/store/slices/supplyChainSlice';

interface InventoryRequisitionModalProps {
    onClose: () => void;
    onSave: (requisition: InventoryRequisition) => void;
    products: Product[];
    branches: Branch[];
    initialRequisition?: Partial<InventoryRequisition>;
    readOnly?: boolean;
}

const InventoryRequisitionModal: React.FC<InventoryRequisitionModalProps> = ({ onClose, onSave, products, branches, initialRequisition, readOnly }) => {
    const dispatch = useAppDispatch();
    const { items: supplyChainItems } = useAppSelector(s => s.supplyChain);
    
    useEffect(() => {
        dispatch(fetchSupplyChainItems());
    }, [dispatch]);
    
    const productOptions = useMemo(() => {
        const productOpts = (products || []).map(p => ({ id: p.id, name: p.name, type: 'product' }));
        const supplyOpts = (supplyChainItems || []).map((s, i) => ({ id: `supply_${s.id || i}_${i}`, name: s.productName, type: 'supply', quantity: s.quantity, unit: s.unit }));
        return [...productOpts, ...supplyOpts];
    }, [products, supplyChainItems]);
    const [requisition, setRequisition] = useState<Partial<InventoryRequisition>>(() => {
        if (initialRequisition) {
            return {
                id: String(initialRequisition.id ?? ''),
                date: String(initialRequisition.date ?? new Date().toISOString().split('T')[0]),
                type: (initialRequisition.type as any) ?? 'Transfer',
                warehouseId: String((initialRequisition as any).warehouseId ?? (initialRequisition as any).branchId ?? ''),
                items: (initialRequisition.items || []).map(i => ({ productId: (i as any).productId, quantity: Number((i as any).quantity) })),
                notes: initialRequisition.notes ?? ''
            };
        }
        return {
            id: String(Math.floor(Math.random() * 90000) + 10000),
            date: new Date().toISOString().split('T')[0],
            type: 'Transfer',
            warehouseId: String(branches[0]?.id || ''),
            items: [{ productId: '', quantity: 1 }],
            notes: '',
        };
    });

    const handleFieldChange = (field: keyof InventoryRequisition, value: any) => {
        setRequisition(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (index: number, field: keyof InventoryRequisitionItem, value: any) => {
        const newItems = [...(requisition.items || [])];
        if (field === 'productId') {
            newItems[index].productId = value;
        }
        if (field === 'quantity') {
            const q = Math.max(1, Number(value) || 0);
            newItems[index].quantity = q;
        }
        setRequisition(prev => ({ ...prev, items: newItems }));
    };

    const handleAddItem = () => {
        setRequisition(prev => ({ ...prev, items: [...(prev.items || []), { productId: '', quantity: 1 }] }));
    };

    const handleRemoveItem = (index: number) => {
        setRequisition(prev => ({ ...prev, items: (prev.items || []).filter((_, i) => i !== index) }));
    };

    const handleSaveClick = () => {
        console.log('Save clicked, requisition:', requisition);
        const items = (requisition.items || []).map(i => ({
            productId: String(i.productId),
            quantity: Number(i.quantity)
        }));
        const hasInvalid = items.length === 0 || items.some(i => !i.productId || i.quantity <= 0);
        if (!requisition.warehouseId || hasInvalid) {
            alert('يرجى اختيار المستودع وتحديد بنود صحيحة (منتج وكمية أكبر من 0).');
            return;
        }
        const normalized: InventoryRequisition = {
            id: String(requisition.id || ''),
            date: String(requisition.date || new Date().toISOString().split('T')[0]),
            type: (requisition.type as any) || 'Transfer',
            warehouseId: String(requisition.warehouseId),
            items,
            notes: requisition.notes || '',
            attachments: requisition.attachments || []
        };
        console.log('Calling onSave with:', normalized);
        onSave(normalized);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{ maxWidth: '60rem' }}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>إضافة طلبية مخزنية</h2>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {!readOnly && (
                            <button
                                onClick={handleSaveClick}
                                className="btn btn-secondary"
                                disabled={!(requisition.warehouseId && (requisition.items || []).length > 0)}
                            >حفظ</button>
                        )}
                        <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
                    </div>
                </div>
                <div className="modal-body">
                    <div className="form-section">
                        <div className="form-section-header">معلومات عامة</div>
                        <div className="form-section-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                            <div><label className="form-label required">الكود</label><input type="text" value={requisition.id} className="form-input" disabled /></div>
                            <div><label className="form-label">التاريخ</label><input type="date" value={requisition.date} onChange={e => handleFieldChange('date', e.target.value)} className="form-input" disabled={!!readOnly} /></div>
                            <div>
                                <label className="form-label required">النوع</label>
                                <select value={requisition.type} onChange={e => handleFieldChange('type', e.target.value)} className="form-select" disabled={!!readOnly}>
                                    <option value="Transfer">تحويل</option>
                                    <option value="Purchase">شراء</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label required">المستودع</label>
                                <select value={requisition.warehouseId} onChange={e => handleFieldChange('warehouseId', e.target.value)} className="form-select" disabled={!!readOnly}>
                                    {branches.map(b => {
                                        const bid = String(((b as any)._id ?? (b as any).id) || '');
                                        return <option key={bid} value={bid}>{b.name}</option>;
                                    })}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="form-section-header">بنود الطلب المخزني</div>
                        <div className="form-section-body">
                            <div className="table-wrapper">
                                <table style={{backgroundColor: '#f9fcff'}}>
                                    <thead><tr style={{backgroundColor: '#f0f7ff'}}><th style={{padding: '0.75rem'}}>البند</th><th style={{padding: '0.75rem', width: '150px'}}>الكمية</th><th style={{width: '50px'}}></th></tr></thead>
                                    <tbody>
                                        {(requisition.items || []).map((item, index) => (
                                            <tr key={index}>
                                                <td style={{padding: '0.5rem'}}>
                                                    <select
                                                        value={item.productId || ''}
                                                        onChange={e => handleItemChange(index, 'productId', e.target.value)}
                                                        className="form-select"
                                                        disabled={!!readOnly}
                                                    >
                                                        <option value="">اختر...</option>
                                                        {productOptions.map((p, idx) => (
                                                            <option key={`${p.id}_${idx}`} value={p.id}>
                                                                {p.name} {(p as any).type === 'supply' ? `(${(p as any).quantity || 0} ${(p as any).unit || 'وحدة'})` : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td style={{padding: '0.5rem'}}><input type="number" min={1} value={item.quantity || 1} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="form-input" disabled={!!readOnly} /></td>
                                                <td>{!readOnly && (<button type="button" onClick={() => handleRemoveItem(index)} style={{color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer'}}><TrashIcon style={{width:'20px',height:'20px'}}/></button>)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {!readOnly && (<div style={{marginTop: '1rem', textAlign: 'left'}}><button type="button" onClick={handleAddItem} className="btn btn-ghost"><PlusIcon style={{width:'20px',height:'20px'}}/> إضافة بند</button></div>)}
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="form-section-header">خيارات أكثر</div>
                        <div className="form-section-body" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
                           <div>
                                <label className="form-label">الملاحظات</label>
                                <textarea value={requisition.notes || ''} onChange={(e) => handleFieldChange('notes', e.target.value)} className="form-input" rows={5} disabled={!!readOnly}></textarea>
                           </div>
                           <div>
                                <label className="form-label">المرفقات</label>
                                <div className="file-upload-area" onClick={() => !readOnly && document.getElementById('file-input')?.click()}>
                                    <input 
                                        id="file-input" 
                                        type="file" 
                                        multiple 
                                        accept=".pdf,.doc,.docx,.odt,.png,.jpg,.jpeg" 
                                        style={{display: 'none'}} 
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            const fileNames = files.map(f => f.name);
                                            handleFieldChange('attachments', [...(requisition.attachments || []), ...fileNames]);
                                        }}
                                        disabled={!!readOnly}
                                    />
                                    <UploadIcon className="icon" style={{marginRight: '0.5rem', width: 24, height: 24}} />
                                    <span>أسحب الصورة هنا أو <span style={{color: 'var(--primary-color)', textDecoration: 'underline'}}>اختر من جهازك</span></span>
                                    <p style={{fontSize: '0.8rem', marginTop: '0.5rem'}}>أنواع الملفات المسموح بها (pdf, doc, docx, odt, png, jpg, jpeg)</p>
                                    {(requisition.attachments || []).length > 0 && (
                                        <div style={{marginTop: '0.5rem', textAlign: 'left'}}>
                                            {(requisition.attachments || []).map((file, i) => (
                                                <div key={i} style={{fontSize: '0.8rem', color: '#666'}}>{file}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryRequisitionModal;