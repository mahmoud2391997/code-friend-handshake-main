import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { fetchSupplyChainItems } from '../src/store/slices/supplyChainSlice';
import { useToasts } from './Toast';

interface RequisitionItem {
  id: string;
  supplyChainItemId: string;
  productName: string;
  quantity: number;
}

interface InventoryRequisitionProps {
  onSave?: (items: RequisitionItem[]) => void;
}

const InventoryRequisition: React.FC<InventoryRequisitionProps> = ({ onSave }) => {
  const dispatch = useAppDispatch();
  const { addToast } = useToasts();
  const { items: supplyChainItems } = useAppSelector(s => s.supplyChain);
  
  const [requisitionItems, setRequisitionItems] = useState<RequisitionItem[]>([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    dispatch(fetchSupplyChainItems());
  }, [dispatch]);

  const addRequisitionItem = () => {
    if (!selectedItem) {
      addToast('يرجى اختيار بند', 'error');
      return;
    }

    const supplyItem = supplyChainItems.find(item => String(item.id) === selectedItem);
    if (!supplyItem) {
      addToast('البند المحدد غير موجود', 'error');
      return;
    }

    const newItem: RequisitionItem = {
      id: `req_${Date.now()}`,
      supplyChainItemId: selectedItem,
      productName: supplyItem.productName,
      quantity: quantity
    };

    setRequisitionItems([...requisitionItems, newItem]);
    setSelectedItem('');
    setQuantity(1);
  };

  const removeRequisitionItem = (id: string) => {
    setRequisitionItems(requisitionItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    setRequisitionItems(requisitionItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleSave = () => {
    if (requisitionItems.length === 0) {
      addToast('يرجى إضافة بنود للطلبية', 'error');
      return;
    }
    
    onSave?.(requisitionItems);
    addToast('تم حفظ الطلبية المخزنية', 'success');
  };

  return (
    <div className="glass-pane" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
        الطلبيات المخزنية
      </h3>

      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ marginBottom: '1rem' }}>بنود الطلب المخزني</h4>
        
        <table style={{ width: '100%', marginBottom: '1rem' }}>
          <thead>
            <tr>
              <th>البند</th>
              <th>الكمية</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {requisitionItems.map(item => (
              <tr key={item.id}>
                <td>{item.productName}</td>
                <td>
                  <input 
                    type="number" 
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                    className="form-input"
                    style={{ width: '80px' }}
                    min="1"
                  />
                </td>
                <td>
                  <button 
                    onClick={() => removeRequisitionItem(item.id)}
                    className="btn btn-ghost"
                    style={{ color: 'red' }}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
          <select 
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            className="form-input"
            style={{ minWidth: '200px' }}
          >
            <option value="">اختر...</option>
            {supplyChainItems.map(item => (
              <option key={item.id} value={String(item.id)}>
                {item.productName} ({item.quantity} {item.unit})
              </option>
            ))}
          </select>
          
          <input 
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="form-input"
            style={{ width: '80px' }}
            min="1"
            placeholder="الكمية"
          />
          
          <button onClick={addRequisitionItem} className="btn btn-primary">
            إضافة بند
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button onClick={handleSave} className="btn btn-primary">
            حفظ الطلبية
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryRequisition;