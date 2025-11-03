import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { fetchInventory } from '../src/store/slices/inventorySlice';
import { FormulaLine } from '../types';

interface FormulaBuilderProps {
  formula: FormulaLine[];
  onChange: (formula: FormulaLine[]) => void;
}

const FormulaBuilder: React.FC<FormulaBuilderProps> = ({ formula, onChange }) => {
  const dispatch = useAppDispatch();
  const { items: inventoryItems } = useAppSelector(s => s.inventory);
  const [selectedMaterial, setSelectedMaterial] = useState('');

  useEffect(() => {
    dispatch(fetchInventory({}));
  }, [dispatch]);

  const totalPercentage = formula.reduce((sum, line) => sum + line.percentage, 0);

  const addFormulaLine = () => {
    if (!selectedMaterial) return;
    
    const material = inventoryItems.find(item => item.id === selectedMaterial);
    if (!material) return;

    const newLine: FormulaLine = {
      id: `formula_${Date.now()}`,
      materialId: parseInt(material.id),
      materialName: material.name,
      materialSku: material.sku || '',
      kind: 'AROMA_OIL',
      percentage: 0,
      density: 1.0
    };

    onChange([...formula, newLine]);
    setSelectedMaterial('');
  };

  const updateFormulaLine = (index: number, field: keyof FormulaLine, value: any) => {
    const updated = [...formula];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeFormulaLine = (index: number) => {
    const updated = formula.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <h4>الصيغة</h4>
        <p style={{ color: totalPercentage === 100 ? 'green' : 'red' }}>
          مجموع نسب الصيغة يجب أن يكون 100% (حالياً: {totalPercentage.toFixed(2)}%)
        </p>
      </div>

      <table style={{ width: '100%', marginBottom: '1rem' }}>
        <thead>
          <tr>
            <th>المادة</th>
            <th>النوع</th>
            <th>النسبة %</th>
            <th>الكثافة</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {formula.map((line, index) => (
            <tr key={line.id}>
              <td>{line.materialName}</td>
              <td>
                <select 
                  value={line.kind} 
                  onChange={(e) => updateFormulaLine(index, 'kind', e.target.value)}
                  className="form-input"
                >
                  <option value="AROMA_OIL">زيت عطري</option>
                  <option value="ETHANOL">إيثانول</option>
                  <option value="DI_WATER">ماء مقطر</option>
                  <option value="FIXATIVE">مثبت</option>
                  <option value="COLOR">لون</option>
                  <option value="ADDITIVE">إضافة</option>
                </select>
              </td>
              <td>
                <input 
                  type="number" 
                  value={line.percentage} 
                  onChange={(e) => updateFormulaLine(index, 'percentage', parseFloat(e.target.value) || 0)}
                  className="form-input"
                  style={{ width: '80px' }}
                />
              </td>
              <td>
                <input 
                  type="number" 
                  value={line.density || 1.0} 
                  onChange={(e) => updateFormulaLine(index, 'density', parseFloat(e.target.value) || 1.0)}
                  className="form-input"
                  style={{ width: '80px' }}
                  step="0.1"
                />
              </td>
              <td>
                <button 
                  onClick={() => removeFormulaLine(index)}
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

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <select 
          value={selectedMaterial} 
          onChange={(e) => setSelectedMaterial(e.target.value)}
          className="form-input"
        >
          <option value="">اختر المادة</option>
          {inventoryItems.map(item => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.sku})
            </option>
          ))}
        </select>
        <button onClick={addFormulaLine} className="btn btn-primary">
          إضافة مكون
        </button>
      </div>

      <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>
        الإجمالي: {totalPercentage.toFixed(2)}%
      </div>
    </div>
  );
};

export default FormulaBuilder;