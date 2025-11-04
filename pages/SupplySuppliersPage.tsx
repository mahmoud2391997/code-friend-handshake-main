import React, { useEffect, useMemo, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../App';
import { PlusIcon, FilterIcon, RefreshIcon } from '../components/Icon';
import { useToasts } from '../components/Toast';
import { fetchSupplySuppliers, createSupplySupplier, updateSupplySupplier } from '../src/store/slices/supplySuppliersSlice';
import type { RootState, AppDispatch } from '../src/store';
import { Role } from '../types';

interface SupplySupplier {
  _id?: string;
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  suppliedMaterials: string[];
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

interface SupplySuppliersPageProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const SupplySuppliersPage: React.FC<SupplySuppliersPageProps> = ({ activeView, setActiveView }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useContext(AuthContext);
  const { addToast } = useToasts();

  const suppliers = useSelector((state: RootState) => state.supplySuppliers?.suppliers || []);
  const loading = useSelector((state: RootState) => state.supplySuppliers?.loading || false);
  const error = useSelector((state: RootState) => state.supplySuppliers?.error);
  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplySupplier | null>(null);

  useEffect(() => {
    dispatch(fetchSupplySuppliers());
  }, [dispatch]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const matchesText = !filterText || 
        supplier.name.toLowerCase().includes(filterText.toLowerCase()) ||
        supplier.contactPerson.toLowerCase().includes(filterText.toLowerCase()) ||
        supplier.phone.includes(filterText) ||
        supplier.email.toLowerCase().includes(filterText.toLowerCase());
      const matchesStatus = filterStatus === 'ALL' || supplier.status === filterStatus;
      return matchesText && matchesStatus;
    });
  }, [suppliers, filterText, filterStatus]);

  const handleSave = async (supplierData: Omit<SupplySupplier, 'id' | '_id' | 'createdAt'>) => {
    try {
      if (editingSupplier) {
        await dispatch(updateSupplySupplier({ 
          id: editingSupplier.id || editingSupplier._id!, 
          data: supplierData 
        })).unwrap();
        addToast('تم تحديث المورد بنجاح', 'success');
      } else {
        await dispatch(createSupplySupplier(supplierData)).unwrap();
        addToast('تم إضافة المورد بنجاح', 'success');
      }
      setModalOpen(false);
      setEditingSupplier(null);
    } catch (error: any) {
      addToast(error || 'فشل في حفظ المورد', 'error');
    }
  };

  const handleEdit = (supplier: SupplySupplier) => {
    setEditingSupplier(supplier);
    setModalOpen(true);
  };

  const handleStatusToggle = async (supplierId: string) => {
    try {
      const supplier = suppliers.find(s => s.id === supplierId || s._id === supplierId);
      if (supplier) {
        await dispatch(updateSupplySupplier({ 
          id: supplierId, 
          data: { status: supplier.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } 
        })).unwrap();
        addToast('تم تحديث حالة المورد', 'success');
      }
    } catch (error: any) {
      addToast(error || 'فشل في تحديث الحالة', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE' 
      ? { bg: '#d1fae5', color: '#065f46' }
      : { bg: '#fee2e2', color: '#991b1b' };
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
          موردي المواد الخام
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {user?.role === Role.SuperAdmin && (
            <button
              onClick={() => {
                setEditingSupplier(null);
                setModalOpen(true);
              }}
              className="btn btn-primary"
              style={{
                fontSize: isMobile ? '0.875rem' : '1rem',
                padding: isMobile ? '0.5rem 0.75rem' : undefined,
              }}
            >
              <PlusIcon style={{ width: 16, height: 16, marginLeft: '0.25rem' }} />
              {isMobile ? 'إضافة' : 'إضافة مورد'}
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
            placeholder="بحث بالاسم أو الهاتف أو البريد..."
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
            minWidth: 120,
            fontSize: isMobile ? '0.875rem' : '1rem',
          }}
        >
          <option value="ALL">جميع الحالات</option>
          <option value="ACTIVE">نشط</option>
          <option value="INACTIVE">غير نشط</option>
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
                <th>اسم المورد</th>
                <th>الشخص المسؤول</th>
                <th>الهاتف</th>
                {!isMobile && <th>البريد الإلكتروني</th>}
                <th>المواد المورّدة</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length ? (
                filteredSuppliers.map((supplier) => {
                  const statusStyle = getStatusColor(supplier.status);
                  return (
                    <tr key={supplier.id || supplier._id}>
                      <td style={{ fontWeight: 600 }}>{supplier.name}</td>
                      <td>{supplier.contactPerson}</td>
                      <td>{supplier.phone}</td>
                      {!isMobile && <td>{supplier.email}</td>}
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {supplier.suppliedMaterials.slice(0, 2).map((material, idx) => (
                            <span
                              key={idx}
                              style={{
                                padding: '0.125rem 0.375rem',
                                borderRadius: '0.25rem',
                                backgroundColor: '#f3f4f6',
                                color: '#374151',
                                fontSize: '0.75rem',
                              }}
                            >
                              {material}
                            </span>
                          ))}
                          {supplier.suppliedMaterials.length > 2 && (
                            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                              +{supplier.suppliedMaterials.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                          fontWeight: 500,
                        }}>
                          {supplier.status === 'ACTIVE' ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button
                            onClick={() => handleEdit(supplier)}
                            className="btn btn-ghost"
                            style={{ color: '#1e40af', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => handleStatusToggle(supplier.id || supplier._id!)}
                            className="btn btn-ghost"
                            style={{ 
                              color: supplier.status === 'ACTIVE' ? '#991b1b' : '#065f46', 
                              padding: '0.25rem 0.5rem', 
                              fontSize: '0.75rem' 
                            }}
                          >
                            {supplier.status === 'ACTIVE' ? 'إلغاء تفعيل' : 'تفعيل'}
                          </button>
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
                    لا توجد موردين مطابقين
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Simple Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="glass-pane" style={{
            width: '90%',
            maxWidth: '500px',
            padding: '1.5rem',
            margin: '1rem',
          }}>
            <h3 style={{ marginBottom: '1rem' }}>
              {editingSupplier ? 'تعديل المورد' : 'إضافة مورد جديد'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const suppliedMaterials = (formData.get('suppliedMaterials') as string)
                .split(',')
                .map(m => m.trim())
                .filter(m => m);
              
              handleSave({
                name: formData.get('name') as string,
                contactPerson: formData.get('contactPerson') as string,
                phone: formData.get('phone') as string,
                email: formData.get('email') as string,
                address: formData.get('address') as string,
                suppliedMaterials,
                status: (formData.get('status') as 'ACTIVE' | 'INACTIVE') || 'ACTIVE',
              });
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  name="name"
                  placeholder="اسم المورد"
                  defaultValue={editingSupplier?.name || ''}
                  required
                  style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #e5e7eb' }}
                />
                <input
                  name="contactPerson"
                  placeholder="الشخص المسؤول"
                  defaultValue={editingSupplier?.contactPerson || ''}
                  required
                  style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #e5e7eb' }}
                />
                <input
                  name="phone"
                  placeholder="رقم الهاتف"
                  defaultValue={editingSupplier?.phone || ''}
                  required
                  style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #e5e7eb' }}
                />
                <input
                  name="email"
                  type="email"
                  placeholder="البريد الإلكتروني"
                  defaultValue={editingSupplier?.email || ''}
                  required
                  style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #e5e7eb' }}
                />
                <textarea
                  name="address"
                  placeholder="العنوان"
                  defaultValue={editingSupplier?.address || ''}
                  required
                  style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #e5e7eb', minHeight: '80px' }}
                />
                <input
                  name="suppliedMaterials"
                  placeholder="المواد المورّدة (مفصولة بفواصل)"
                  defaultValue={editingSupplier?.suppliedMaterials.join(', ') || ''}
                  required
                  style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #e5e7eb' }}
                />
                <select
                  name="status"
                  defaultValue={editingSupplier?.status || 'ACTIVE'}
                  style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #e5e7eb' }}
                >
                  <option value="ACTIVE">نشط</option>
                  <option value="INACTIVE">غير نشط</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingSupplier ? 'تحديث' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingSupplier(null);
                  }}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplySuppliersPage;