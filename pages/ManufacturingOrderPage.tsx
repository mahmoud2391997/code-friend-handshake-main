import React, { useEffect, useMemo, useState, useCallback } from 'react';
import AIFormulaModal from '../components/AIFormulaModal';
import {
  BeakerIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CubeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  LocationMarkerIcon,
  PlusIcon,
  SparklesIcon,
  TrashIcon,
  UsersIcon,
  XCircleIcon,
} from '../components/Icon';
import { useDispatch, useSelector } from 'react-redux';
import { useToasts } from '../components/Toast';
import {
  Branch,
  EmployeeData,
  FormulaLine,
  InventoryItem,
  ManufacturingOrder,
  PackagingItem,
  ProcessLoss,
  Product,
  QCCheck,
 
} from '../types';
import { RootState, AppDispatch } from '@/src/store';
import 'jspdf-autotable';
import {
  createManufacturingOrder,
  updateManufacturingOrder,
  fetchManufacturingOrders,
} from '../src/store/slices/manufacturingOrdersSlice';

interface ManufacturingOrderPageProps {
  orderId?: string;
  branches: Branch[];
  products: Product[];
  inventory: InventoryItem[];
  employees: EmployeeData[];
  onSave: (order: ManufacturingOrder) => void;
}

type ValidationErrors = { [key: string]: string };

/* -------------------------------------------------------------------------- */
/*                                 MATH HELPERS                               */
/* -------------------------------------------------------------------------- */
const perfumeMath = {
  calculateTheoreticalMl: (units: number, size: number) => (units || 0) * (size || 0),

  calculateQuantitiesFromFormula: (
    formula: FormulaLine[],
    totalVolume: number,
    products: Product[]
  ) => {
    return formula.map((line) => {
      const volumeMl = (line.percentage / 100) * totalVolume;
      const product = products.find((m) => m.id === line.materialId);
      const density = line.density || product?.density || 1;
      const quantityG = volumeMl * density;
      return {
        ...line,
        requiredMl: volumeMl,
        requiredG: quantityG,
      };
    });
  },

  calculateExpectedYield: (theoreticalMl: number, loss: ProcessLoss) => {
    return (
      theoreticalMl *
      (1 - (loss.mixingLossPct || 0) / 100) *
      (1 - (loss.filtrationLossPct || 0) / 100) *
      (1 - (loss.fillingLossPct || 0) / 100)
    );
  },

  calculateYieldPercentage: (actualMl?: number, theoreticalMl?: number) => {
    if (!actualMl || !theoreticalMl || theoreticalMl === 0) return 0;
    return (actualMl / theoreticalMl) * 100;
  },
};

/* -------------------------------------------------------------------------- */
/*                                 VALIDATION                                 */
/* -------------------------------------------------------------------------- */
const validateOrder = (order: ManufacturingOrder): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!order.productName) errors.productName = 'اسم المنتج مطلوب.';
  if (!order.unitsRequested || order.unitsRequested <= 0)
    errors.unitsRequested = 'الكمية يجب أن تكون أكبر من 0.';
  if (!order.bottleSizeMl || order.bottleSizeMl <= 0)
    errors.bottleSizeMl = 'الحجم يجب أن يكون أكبر من 0.';
  if (!order.manufacturingDate) errors.manufacturingDate = 'تاريخ التصنيع مطلوب.';

  const formulaTotal = order.formula.reduce(
    (sum, line) => sum + (line.percentage || 0),
    0
  );
  if (Math.abs(formulaTotal - 100) > 0.01)
    errors.formula = `مجموع نسب الصيغة يجب أن يكون 100% (حالياً: ${formulaTotal.toFixed(
      2
    )}%).`;

  if (order.manufacturingType === 'CONTRACT') {
    const distTotal = (order.distribution || []).reduce(
      (sum, d) => sum + d.units,
      0
    );
    if (order.unitsRequested !== undefined && distTotal !== order.unitsRequested)
      errors.distribution = `إجمالي التوزيع (${distTotal}) لا يطابق الكمية المطلوبة (${order.unitsRequested}).`;
  }

  return errors;
};

/* -------------------------------------------------------------------------- */
/*                               REUSABLE UI PARTS                           */
/* -------------------------------------------------------------------------- */
const SectionCard: React.FC<{
  title: string;
  icon: React.FC<any>;
  children: React.ReactNode;
  error?: string;
  rightHeaderContent?: React.ReactNode;
}> = ({ title, icon: Icon, children, error, rightHeaderContent }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="glass-pane manufacturing-section-card">
      <div
        className="manufacturing-section-header"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          borderBottom: isOpen ? '1px solid var(--surface-border)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Icon style={{ width: '24px', height: '24px', color: 'var(--primary-color)' }} />
          <h3
            className="manufacturing-section-title"
            style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}
          >
            {title}
          </h3>
          {error && (
            <span
              style={{
                color: '#ef4444',
                fontSize: '0.9rem',
                fontWeight: 500,
                marginRight: '1rem',
              }}
            >
              ({error})
            </span>
          )}
        </div>
        <div
          className="manufacturing-section-actions"
          style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
        >
          {rightHeaderContent}
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {isOpen ? (
              <ChevronUpIcon style={{ width: '24px', height: '24px', color: 'var(--text-secondary)' }} />
            ) : (
              <ChevronDownIcon style={{ width: '24px', height: '24px', color: 'var(--text-secondary)' }} />
            )}
          </button>
        </div>
      </div>
      {isOpen && <div style={{ padding: '1.5rem' }}>{children}</div>}
    </div>
  );
};

const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="manufacturing-form-row"
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1.5rem',
      marginBottom: '1.5rem',
    }}
  >
    {children}
  </div>
);

const FormField: React.FC<{
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
}> = ({ label, children, required, error }) => (
  <div className="manufacturing-form-field">
    <label className={`form-label manufacturing-label ${required ? 'required' : ''}`}>
      {label}
    </label>
    {children}
    {error && <p className="error-text">{error}</p>}
  </div>
);

/* -------------------------------------------------------------------------- */
/*                               STATUS MANAGER                               */
/* -------------------------------------------------------------------------- */
const OrderStatusManager: React.FC<{
  order: ManufacturingOrder;
  onStatusChange: (newStatus: ManufacturingOrder['status']) => void;
  isValid: boolean;
}> = ({ order, onStatusChange, isValid }) => {
  const { addToast } = useToasts();

  const statusConfig: Record<
    ManufacturingOrder['status'],
    { label: string; color: string; next?: { status: ManufacturingOrder['status']; label: string } }
  > = {
    DRAFT: { label: 'مسودة', color: '#8a94a2', next: { status: 'IN_PROGRESS', label: 'بدء الإنتاج' } },
    IN_PROGRESS: {
      label: 'قيد التنفيذ',
      color: '#3b82f6',
      next: { status: 'MACERATING', label: 'بدء التعتيق (المكسرة)' },
    },
    MACERATING: {
      label: 'في التعتيق',
      color: '#8b5cf6',
      next: { status: 'QC', label: 'إرسال للفحص' },
    },
    QC: {
      label: 'تحت الفحص',
      color: '#f59e0b',
      next: { status: 'PACKAGING', label: 'الموافقة والبدء بالتغليف' },
    },
    PACKAGING: {
      label: 'تغليف',
      color: '#10b981',
      next: { status: 'DONE', label: 'إنهاء الإنتاج' },
    },
    DONE: {
      label: 'مكتمل',
      color: '#16a34a',
      next: { status: 'CLOSED', label: 'إغلاق الأمر' },
    },
    CLOSED: { label: 'مغلق', color: '#5a6472' },
  };

  const current = statusConfig[order.status];
  const next = current.next;

  const handleNext = () => {
    if (!isValid) {
      addToast('لا يمكن المتابعة، يرجى إصلاح الأخطاء في النموذج.', 'error');
      return;
    }
    if (next) onStatusChange(next.status);
  };

  return (
    <div
      className="manufacturing-status-manager"
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
    >
      <div
        className="manufacturing-status-info"
        style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
      >
        <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>الحالة الحالية:</span>
        <span
          className="manufacturing-status-badge"
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '999px',
            backgroundColor: current.color,
            color: 'white',
            fontWeight: 600,
            fontSize: '1rem',
          }}
        >
          {current.label}
        </span>
      </div>
      {next && (
        <button className="btn btn-secondary manufacturing-button" onClick={handleNext}>
          {next.label}
        </button>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */
const ManufacturingOrderPage: React.FC<ManufacturingOrderPageProps> = (props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders: manufacturingOrders, loading, error } = useSelector(
    (state: RootState) => state.manufacturingOrders
  );
  const { addToast } = useToasts();

  const [localOrder, setLocalOrder] = useState<ManufacturingOrder | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  /* ------------------------------ FETCH ORDERS ----------------------------- */
  useEffect(() => {
    // Check if branchId is available before fetching
    if (props.branches && props.branches.length > 0) {
      dispatch(fetchManufacturingOrders());
    }
  }, [dispatch, props.branches]);

  /* --------------------------- INITIALISE ORDER --------------------------- */
  useEffect(() => {
    if (props.orderId) {
      const found = manufacturingOrders.find((o) => o.id === props.orderId);
      if (found) {
        setLocalOrder(found);
      } else if (!loading && !error) {
        console.warn(`Order with ID ${props.orderId} not found.`);
        setLocalOrder(null);
      }
    } else {
      setLocalOrder({
        id: 'NEW',
        productName: '',
        manufacturingType: 'INTERNAL',
        responsibleEmployeeId: undefined,
        concentration: 'EDT_15',
        bottleSizeMl: 0,
        unitsRequested: 0,
        batchCode: '',
        branchId: 0,
        manufacturingDate: undefined,
        expiryDate: undefined,
        dueAt: undefined,
        formula: [],
        processLoss: { mixingLossPct: 0, filtrationLossPct: 0, fillingLossPct: 0 },
        macerationDays: 0,
        chilling: undefined,
        filtration: undefined,
        qc: undefined,
        packagingItems: [],
        costs: {
          materials: 0,
          labor: 0,
          overhead: 0,
          packaging: 0,
          other: 0,
          total: 0,
          perMl: 0,
          perBottle: 0,
          suggestedRetail: 0,
        },
        yield: {
          theoreticalMl: 0,
          expectedMl: 0,
          actualMl: undefined,
          expectedUnits: 0,
          actualUnits: undefined,
          yieldPercentage: undefined,
        },
        distribution: [],
        status: 'DRAFT',
      });
    }
  }, [props.orderId, manufacturingOrders, loading, error]);

  /* ------------------------------- VALIDATE ------------------------------- */
  useEffect(() => {
    if (localOrder) setErrors(validateOrder(localOrder));
  }, [localOrder]);

  /* -------------------------------- SAVE -------------------------------- */
  const handleSave = () => {
    if (!localOrder) return;
    const curErrors = validateOrder(localOrder);
    setErrors(curErrors);
    if (Object.keys(curErrors).length > 0) {
      addToast('يرجى إصلاح الأخطاء قبل الحفظ.', 'error');
      return;
    }

    const action =
      localOrder.id && localOrder.id !== 'NEW'
        ? updateManufacturingOrder(localOrder)
        : createManufacturingOrder(localOrder);

    dispatch(action)
      .unwrap()
      .then(() => addToast('تم حفظ أمر التصنيع بنجاح!', 'success'))
      .catch((err: any) =>
        addToast(`فشل الحفظ: ${err.message || 'خطأ غير معروف'}`, 'error')
      );
  };

  /* --------------------------- RECALCULATE YIELD -------------------------- */
  useEffect(() => {
    if (!localOrder) return;
    if (
      typeof localOrder.unitsRequested !== 'number' ||
      localOrder.unitsRequested <= 0 ||
      typeof localOrder.bottleSizeMl !== 'number' ||
      localOrder.bottleSizeMl <= 0
    )
      return;

    const theoreticalMl = perfumeMath.calculateTheoreticalMl(
      localOrder.unitsRequested,
      localOrder.bottleSizeMl
    );
    const expectedMl = perfumeMath.calculateExpectedYield(theoreticalMl, localOrder.processLoss);
    const expectedUnits = Math.floor(expectedMl / localOrder.bottleSizeMl);
    const yieldPercentage = perfumeMath.calculateYieldPercentage(
      localOrder.yield.actualMl,
      theoreticalMl
    );

    setLocalOrder((prev) =>
      prev
        ? {
            ...prev,
            yield: {
              ...prev.yield,
              theoreticalMl,
              expectedMl,
              expectedUnits,
              yieldPercentage,
            },
          }
        : null
    );
  }, [
    localOrder?.unitsRequested,
    localOrder?.bottleSizeMl,
    localOrder?.processLoss,
    localOrder?.yield.actualMl,
  ]);

  /* --------------------------- STATUS CHANGE --------------------------- */
  const handleStatusChange = useCallback(
    (newStatus: ManufacturingOrder['status']) => {
      if (!localOrder) return;
      const updated = { ...localOrder, status: newStatus };
      if (newStatus === 'IN_PROGRESS' && !localOrder.manufacturingDate) {
        updated.manufacturingDate = new Date().toISOString().split('T')[0];
      }
      setLocalOrder(updated);
      dispatch(updateManufacturingOrder(updated))
        .unwrap()
        .then(() => addToast(`تم تحديث الحالة إلى ${newStatus}`, 'success'))
        .catch((err: any) => {
          addToast(`فشل تحديث الحالة: ${err.message}`, 'error');
          setLocalOrder(localOrder);
        });
    },
    [localOrder, dispatch, addToast]
  );

  /* --------------------------- AI FORMULA APPLY --------------------------- */
  const handleApplyFormula = (formula: FormulaLine[], productName?: string) => {
    if (!localOrder) return;
    setLocalOrder((prev) =>
      prev
        ? {
            ...prev,
            productName: productName || prev.productName,
            formula: formula.map((f) => ({
              ...f,
              id: f.id || `${Date.now()}-${Math.random()}`,
            })),
          }
        : null
    );
    setIsAiModalOpen(false);
    addToast('تم تطبيق الصيغة المقترحة!', 'success');
  };

  const rawMaterials = useMemo(
    () => props.products.filter((p) => p.category === 'Raw Material'),
    [props.products]
  );

  /* ------------------------------ RENDER ------------------------------ */
  if (loading && !localOrder) return <div>جاري التحميل...</div>;
  if (error) return <div>خطأ: {error}</div>;
  if (!localOrder) return <div>الأمر غير موجود.</div>;

  return (
    <div
      className="manufacturing-order-container"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      {/* STATUS */}
      <SectionCard title="إدارة الحالة" icon={UsersIcon}>
        <OrderStatusManager
          order={localOrder}
          onStatusChange={handleStatusChange}
          isValid={Object.keys(errors).length === 0}
        />
      </SectionCard>

      {/* BASIC INFO */}
      <BasicInfoSection
        order={localOrder}
        setOrder={setLocalOrder}
        employees={props.employees}
        errors={errors}
      />

      {/* DISTRIBUTION (CONTRACT ONLY) */}
      {localOrder.manufacturingType === 'CONTRACT' && (
        <SectionCard title="التوزيع" icon={LocationMarkerIcon} error={errors.distribution}>
          <DistributionBuilder order={localOrder} setOrder={setLocalOrder} />
        </SectionCard>
      )}

      {/* FORMULA */}
      <FormulaBuilder
        order={localOrder}
        setOrder={setLocalOrder}
        products={props.products}
        errors={errors}
        onOpenAiModal={() => setIsAiModalOpen(true)}
      />

      {/* MATERIAL RESERVATION */}
      <SectionCard title="حجز الخامات" icon={CubeIcon}>
        <MaterialReservation
          order={localOrder}
          inventory={props.inventory}
          products={props.products}
        />
      </SectionCard>

      {/* PROCESS STEPS */}
      <SectionCard title="المعالجة" icon={CalendarIcon}>
        <ProcessSteps order={localOrder} setOrder={setLocalOrder} />
      </SectionCard>

      {/* QC */}
      <SectionCard title="الفحص والجودة" icon={CheckCircleIcon}>
        <QCChecksSection
          qc={localOrder.qc}
          setQc={(newQc) => setLocalOrder({ ...localOrder, qc: newQc })}
        />
      </SectionCard>

      {/* PACKAGING */}
      <SectionCard title="التعبئة والتغليف" icon={CubeIcon}>
        <PackagingPlanner
          order={localOrder}
          setOrder={setLocalOrder}
          products={props.products}
          inventory={props.inventory}
        />
      </SectionCard>

      {/* COSTING */}
      <SectionCard title="التكلفة والتسعير" icon={CurrencyDollarIcon}>
        <CostingSection
          costs={localOrder.costs}
          setCosts={(newCosts) => setLocalOrder({ ...localOrder, costs: newCosts })}
        />
      </SectionCard>

      {/* YIELD & SUMMARY */}
      <SectionCard title="الناتج والترحيل" icon={CheckCircleIcon}>
        <YieldAndSummary order={localOrder} setOrder={setLocalOrder} onSave={handleSave} />
      </SectionCard>

      {/* AI MODAL */}
      {isAiModalOpen && (
        <AIFormulaModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          onApplyFormula={handleApplyFormula}
          rawMaterials={rawMaterials}
          inventory={props.inventory}
          branchId={Number(localOrder.branchId)}
        />
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                               SUB-COMPONENTS                               */
/* -------------------------------------------------------------------------- */

/* ------------------------------ BASIC INFO ------------------------------ */
const BasicInfoSection: React.FC<{
  order: ManufacturingOrder;
  setOrder: (o: ManufacturingOrder) => void;
  employees: EmployeeData[];
  errors: ValidationErrors;
}> = ({ order, setOrder, employees, errors }) => {
  const handleChange = (field: keyof ManufacturingOrder, value: any) => {
    setOrder({ ...order, [field]: value });
  };

  return (
    <SectionCard title="المعلومات الأساسية" icon={DocumentTextIcon}>
      <FormRow>
        <FormField label="المنتج النهائي" required error={errors.productName}>
          <input
            type="text"
            value={order.productName}
            onChange={(e) => handleChange('productName', e.target.value)}
            className={`form-input manufacturing-input ${errors.productName ? 'input-error' : ''}`}
          />
        </FormField>

        <FormField label="رقم الأمر">
          <input type="text" value={order.id} className="form-input manufacturing-input" disabled />
        </FormField>

        <FormField label="كود الدفعة (Batch)">
          <input type="text" value={order.batchCode} className="form-input manufacturing-input" disabled />
        </FormField>

        <FormField label="نوع التصنيع">
          <select
            value={order.manufacturingType}
            onChange={(e) => handleChange('manufacturingType', e.target.value)}
            className="form-select manufacturing-select"
          >
            <option value="INTERNAL">لتلبية احتياج الشركة</option>
            <option value="CONTRACT">تصنيع للغير</option>
          </select>
        </FormField>
      </FormRow>

      <FormRow>
        <FormField label="التركيز">
          <select
            value={order.concentration}
            onChange={(e) => handleChange('concentration', e.target.value)}
            className="form-select manufacturing-select"
          >
            <option value="EDT_15">EDT 15%</option>
            <option value="EDP_20">EDP 20%</option>
            <option value="EXTRAIT_30">Extrait 30%</option>
            <option value="OIL_100">Oil 100%</option>
          </select>
        </FormField>

        <FormField label="حجم الزجاجة (مل)" required error={errors.bottleSizeMl}>
          <input
            type="number"
            value={order.bottleSizeMl}
            onChange={(e) => handleChange('bottleSizeMl', Number(e.target.value))}
            className={`form-input manufacturing-input ${errors.bottleSizeMl ? 'input-error' : ''}`}
          />
        </FormField>

        <FormField label="الكمية المطلوبة (زجاجة)" required error={errors.unitsRequested}>
          <input
            type="number"
            value={order.unitsRequested}
            onChange={(e) => handleChange('unitsRequested', Number(e.target.value))}
            className={`form-input manufacturing-input ${errors.unitsRequested ? 'input-error' : ''}`}
          />
        </FormField>

        <FormField label="حجم الدفعة (مل)">
          <input
            type="text"
            value={order.yield.theoreticalMl.toFixed(2)}
            className="form-input manufacturing-input"
            disabled
          />
        </FormField>
      </FormRow>

      <FormRow>
        <FormField label="المسؤول عن التصنيع">
          <select
            value={order.responsibleEmployeeId || ''}
            onChange={(e) => handleChange('responsibleEmployeeId', Number(e.target.value))}
            className="form-select manufacturing-select"
          >
            <option value="">اختر مسؤول...</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="تاريخ التصنيع" required error={errors.manufacturingDate}>
          <input
            type="date"
            value={order.manufacturingDate?.split('T')[0] || ''}
            onChange={(e) => handleChange('manufacturingDate', e.target.value)}
            className={`form-input manufacturing-input ${errors.manufacturingDate ? 'input-error' : ''}`}
          />
        </FormField>

        <FormField label="تاريخ الانتهاء">
          <input
            type="date"
            value={order.expiryDate?.split('T')[0] || ''}
            onChange={(e) => handleChange('expiryDate', e.target.value)}
            className="form-input manufacturing-input"
          />
        </FormField>

        <FormField label="تاريخ التسليم">
          <input
            type="date"
            value={order.dueAt?.split('T')[0] || ''}
            onChange={(e) => handleChange('dueAt', e.target.value)}
            className="form-input manufacturing-input"
          />
        </FormField>
      </FormRow>
    </SectionCard>
  );
};

/* --------------------------- DISTRIBUTION BUILDER -------------------------- */
const DistributionBuilder: React.FC<{
  order: ManufacturingOrder;
  setOrder: (o: ManufacturingOrder) => void;
}> = ({ order, setOrder }) => {
  const handleLineChange = (
    index: number,
    field: 'locationName' | 'units',
    value: any
  ) => {
    const newDist = [...(order.distribution || [])];
    (newDist[index] as any)[field] = field === 'units' ? Number(value) : value;
    setOrder({ ...order, distribution: newDist });
  };

  const addLine = () => {
    const line = { id: Date.now().toString(), locationName: '', units: 0 };
    setOrder({ ...order, distribution: [...(order.distribution || []), line] });
  };

  const removeLine = (index: number) => {
    const newDist = (order.distribution || []).filter((_, i) => i !== index);
    setOrder({ ...order, distribution: newDist });
  };

  const total = useMemo(
    () => (order.distribution || []).reduce((s, d) => s + d.units, 0),
    [order.distribution]
  );

  return (
    <>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        حدد أماكن وكميات التوزيع للعميل. يجب أن يتطابق المجموع مع الكمية المطلوبة.
      </p>

      <div className="table-wrapper manufacturing-table-wrapper">
        <table className="manufacturing-table">
          <thead>
            <tr>
              <th>اسم المكان/المحل</th>
              <th style={{ width: '150px' }}>الكمية (وحدة)</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {(order.distribution || []).map((line, idx) => (
              <tr key={line.id}>
                <td style={{ padding: '0.5rem' }}>
                  <input
                    type="text"
                    value={line.locationName}
                    onChange={(e) => handleLineChange(idx, 'locationName', e.target.value)}
                    className="form-input manufacturing-input"
                  />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <input
                    type="number"
                    value={line.units}
                    onChange={(e) => handleLineChange(idx, 'units', e.target.value)}
                    className="form-input manufacturing-input"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    style={{
                      color: '#ef4444',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                    }}
                  >
                    <TrashIcon style={{ width: '20px', height: '20px' }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className="manufacturing-distribution-summary"
        style={{
          marginTop: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <button type="button" onClick={addLine} className="btn btn-ghost manufacturing-button">
          <PlusIcon style={{ width: '20px', height: '20px' }} /> إضافة مكان
        </button>
        <div
          style={{
            fontWeight: 'bold',
            fontSize: '1.1rem',
            color: total !== order.unitsRequested ? '#ef4444' : 'var(--secondary-color)',
          }}
        >
          الإجمالي الموزع: {total} / {order.unitsRequested}
        </div>
      </div>
    </>
  );
};

/* ----------------------------- FORMULA BUILDER --------------------------- */
const FormulaBuilder: React.FC<{
  order: ManufacturingOrder;
  setOrder: (o: ManufacturingOrder) => void;
  products: Product[];
  errors: ValidationErrors;
  onOpenAiModal: () => void;
}> = ({ order, setOrder, products, errors, onOpenAiModal }) => {
  const rawMaterials = useMemo(
    () => products.filter((p) => p.category === 'Raw Material'),
    [products]
  );

  const totalPct = useMemo(
    () => order.formula.reduce((s, l) => s + (l.percentage || 0), 0),
    [order.formula]
  );

  const handleLineChange = (
    index: number,
    field: keyof FormulaLine,
    value: any
  ) => {
    const newFormula = [...order.formula];
    const line = { ...newFormula[index] };

    if (field === 'materialId') {
      const matId = Number(value);
      const mat = rawMaterials.find((m) => m.id === matId);
      if (mat) {
        line.materialId = mat.id;
        line.materialName = mat.name;
        line.materialSku = mat.sku;
        line.density = mat.density;
        const name = mat.name.toLowerCase();
        if (name.includes('oil')) line.kind = 'AROMA_OIL';
        else if (name.includes('ethanol')) line.kind = 'ETHANOL';
        else if (name.includes('water')) line.kind = 'DI_WATER';
        else line.kind = 'ADDITIVE';
      }
    } else if (field === 'percentage' || field === 'density') {
      (line as any)[field] = value === '' ? undefined : parseFloat(value);
    } else {
      (line as any)[field] = value;
    }

    newFormula[index] = line;
    setOrder({ ...order, formula: newFormula });
  };

  const addLine = () => {
    const line: FormulaLine = {
      id: Date.now().toString(),
      materialId: 0,
      materialName: '',
      materialSku: '',
      kind: 'AROMA_OIL',
      percentage: 0,
    };
    setOrder({ ...order, formula: [...order.formula, line] });
  };

  const removeLine = (index: number) => {
    setOrder({ ...order, formula: order.formula.filter((_, i) => i !== index) });
  };

  return (
    <SectionCard
      title="الصيغة"
      icon={BeakerIcon}
      error={errors.formula}
      rightHeaderContent={
        <button onClick={onOpenAiModal} className="btn btn-warning" style={{ padding: '0.5rem 1rem' }}>
          <SparklesIcon style={{ width: 20, height: 20 }} />
          اقتراح بالذكاء الاصطناعي
        </button>
      }
    >
      <div className="table-wrapper manufacturing-table-wrapper">
        <table className="manufacturing-table">
          <thead>
            <tr>
              <th>المادة</th>
              <th>النوع</th>
              <th style={{ width: '120px' }}>النسبة %</th>
              <th style={{ width: '120px' }}>الكثافة</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {order.formula.map((line, idx) => (
              <tr key={line.id}>
                <td style={{ padding: '0.5rem' }}>
                  <select
                    value={line.materialId}
                    onChange={(e) => handleLineChange(idx, 'materialId', e.target.value)}
                    className="form-select manufacturing-select"
                  >
                    <option value={0}>اختر مادة</option>
                    {rawMaterials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.sku})
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <select
                    value={line.kind}
                    onChange={(e) => handleLineChange(idx, 'kind', e.target.value)}
                    className="form-select manufacturing-select"
                  >
                    <option value="AROMA_OIL">زيت عطري</option>
                    <option value="ETHANOL">كحول</option>
                    <option value="DI_WATER">ماء مقطر</option>
                    <option value="FIXATIVE">مثبت</option>
                    <option value="COLOR">لون</option>
                    <option value="ADDITIVE">إضافات</option>
                  </select>
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <input
                    type="number"
                    step="0.01"
                    value={line.percentage || ''}
                    onChange={(e) => handleLineChange(idx, 'percentage', e.target.value)}
                    className="form-input manufacturing-input"
                  />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <input
                    type="number"
                    step="0.01"
                    value={line.density || ''}
                    onChange={(e) => handleLineChange(idx, 'density', e.target.value)}
                    className="form-input manufacturing-input"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    style={{
                      color: '#ef4444',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                    }}
                  >
                    <TrashIcon style={{ width: '20px', height: '20px' }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className="manufacturing-formula-summary"
        style={{
          marginTop: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <button type="button" onClick={addLine} className="btn btn-ghost manufacturing-button">
          <PlusIcon style={{ width: '20px', height: '20px' }} /> إضافة مكون
        </button>
        <div
          style={{
            fontWeight: 'bold',
            fontSize: '1.1rem',
            color: Math.abs(totalPct - 100) > 0.01 ? '#ef4444' : 'var(--secondary-color)',
          }}
        >
          الإجمالي: {totalPct.toFixed(2)}%
        </div>
      </div>
    </SectionCard>
  );
};

/* -------------------------- MATERIAL RESERVATION ------------------------- */
const MaterialReservation: React.FC<{
  order: ManufacturingOrder;
  inventory: InventoryItem[];
  products: Product[];
}> = ({ order, inventory, products }) => {
  const scaled = useMemo(
    () =>
      perfumeMath.calculateQuantitiesFromFormula(
        order.formula,
        order.yield.theoreticalMl,
        products
      ),
    [order.formula, order.yield.theoreticalMl, products]
  );

  const withStock = useMemo(() => {
    // Ensure branchId exists and is valid before filtering inventory
    const branchId = order.branchId ? Number(order.branchId) : null;
    
    return scaled.map((line) => {
      const inv = branchId ? inventory.find(
        (i) => i.productId === line.materialId && Number(i.branchId) === branchId
      ) : undefined;
      
      const available = inv?.quantity || 0;
      const prod = products.find((p) => p.id === line.materialId);
      const required = prod?.baseUnit === 'ml' ? line.requiredMl : line.requiredG;
      return {
        ...line,
        available,
        required,
        unit: prod?.baseUnit || 'g',
        isSufficient: available >= required,
      };
    });
  }, [scaled, inventory, order.branchId, products]);

  return (
    <>
      <div className="table-wrapper manufacturing-table-wrapper">
        <table className="manufacturing-table">
          <thead>
            <tr>
              <th>المادة</th>
              <th>الكمية المطلوبة</th>
              <th>المخزون المتاح</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {withStock.map((mat) => (
              <tr
                key={mat.id}
                style={{
                  backgroundColor: !mat.isSufficient ? 'var(--highlight-low-stock)' : 'transparent',
                }}
              >
                <td>{mat.materialName} ({mat.materialSku})</td>
                <td>
                  {mat.required.toFixed(2)} {mat.unit}
                </td>
                <td style={{ fontWeight: 'bold' }}>
                  {mat.available.toFixed(2)} {mat.unit}
                </td>
                <td>
                  {mat.isSufficient ? (
                    <CheckCircleIcon style={{ color: 'var(--secondary-color)', width: 24, height: 24 }} />
                  ) : (
                    <XCircleIcon style={{ color: '#ef4444', width: 24, height: 24 }} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!withStock.every((m) => m.isSufficient) && (
        <p style={{ marginTop: '1rem', color: '#f59e0b', fontWeight: 600 }}>
          تنبيه: يوجد نقص في بعض المواد الخام. لا يمكن بدء الإنتاج.
        </p>
      )}
    </>
  );
};

/* ------------------------------- PROCESS STEPS --------------------------- */
const ProcessSteps: React.FC<{
  order: ManufacturingOrder;
  setOrder: (o: ManufacturingOrder) => void;
}> = ({ order, setOrder }) => {
  const handleLoss = (field: keyof ProcessLoss, value: number) =>
    setOrder({ ...order, processLoss: { ...order.processLoss, [field]: value } });

  const handleChill = (field: 'hours' | 'temperatureC', value: number) =>
    setOrder({ ...order, chilling: { ...(order.chilling as any), [field]: value } });

  const handleFilt = (field: 'stages' | 'micron', value: number) =>
    setOrder({ ...order, filtration: { ...(order.filtration as any), [field]: value } });

  return (
    <FormRow>
      <FormField label="أيام المكسرة">
        <input
          type="number"
          value={order.macerationDays}
          onChange={(e) => setOrder({ ...order, macerationDays: Number(e.target.value) })}
          className="form-input manufacturing-input"
        />
      </FormField>

      <FormField label="ساعات التبريد">
        <input
          type="number"
          value={order.chilling?.hours || ''}
          onChange={(e) => handleChill('hours', Number(e.target.value))}
          className="form-input manufacturing-input"
        />
      </FormField>

      <FormField label="حرارة التبريد (°C)">
        <input
          type="number"
          value={order.chilling?.temperatureC || ''}
          onChange={(e) => handleChill('temperatureC', Number(e.target.value))}
          className="form-input manufacturing-input"
        />
      </FormField>

      <FormField label="مراحل الفلترة">
        <input
          type="number"
          value={order.filtration?.stages || ''}
          onChange={(e) => handleFilt('stages', Number(e.target.value))}
          className="form-input manufacturing-input"
        />
      </FormField>

      <FormField label="حجم الفلتر (Micron)">
        <input
          type="number"
          step="0.1"
          value={order.filtration?.micron || ''}
          onChange={(e) => handleFilt('micron', Number(e.target.value))}
          className="form-input manufacturing-input"
        />
      </FormField>

      <FormField label="فاقد الخلط (%)">
        <input
          type="number"
          step="0.1"
          value={order.processLoss.mixingLossPct}
          onChange={(e) => handleLoss('mixingLossPct', Number(e.target.value))}
          className="form-input manufacturing-input"
        />
      </FormField>

      <FormField label="فاقد الفلترة (%)">
        <input
          type="number"
          step="0.1"
          value={order.processLoss.filtrationLossPct}
          onChange={(e) => handleLoss('filtrationLossPct', Number(e.target.value))}
          className="form-input manufacturing-input"
        />
      </FormField>

      <FormField label="فاقد التعبئة (%)">
        <input
          type="number"
          step="0.1"
          value={order.processLoss.fillingLossPct}
          onChange={(e) => handleLoss('fillingLossPct', Number(e.target.value))}
          className="form-input manufacturing-input"
        />
      </FormField>
    </FormRow>
  );
};

/* ------------------------------- QC CHECKS ------------------------------- */
const QCChecksSection: React.FC<{
  qc: QCCheck | undefined;
  setQc: (qc: QCCheck) => void;
}> = ({ qc, setQc }) => {
  const handle = (field: keyof QCCheck, value: any) => {
    setQc({ ...(qc as QCCheck), [field]: value });
  };

  return (
    <FormRow>
      <FormField label="المظهر">
        <input
          type="text"
          value={qc?.appearance || ''}
          onChange={(e) => handle('appearance', e.target.value)}
          className="form-input manufacturing-input"
        />
      </FormField>

      <FormField label="الشفافية">
        <select
          value={qc?.clarity || 'Clear'}
          onChange={(e) => handle('clarity', e.target.value)}
          className="form-select manufacturing-select"
        >
          <option value="Clear">Clear</option>
          <option value="Slight Haze">Slight Haze</option>
          <option value="Hazy">Hazy</option>
        </select>
      </FormField>

      <FormField label="مطابقة الرائحة">
        <select
          value={qc?.odorMatch || 'Pass'}
          onChange={(e) => handle('odorMatch', e.target.value)}
          className="form-select manufacturing-select"
        >
          <option value="Pass">Pass</option>
          <option value="Borderline">Borderline</option>
          <option value="Fail">Fail</option>
        </select>
      </FormField>

      <FormField label="النتيجة النهائية">
        <select
          value={qc?.result || 'APPROVED'}
          onChange={(e) => handle('result', e.target.value)}
          className="form-select manufacturing-select"
        >
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
          <option value="REWORK">REWORK</option>
        </select>
      </FormField>
    </FormRow>
  );
};

/* ----------------------------- PACKAGING PLANNER -------------------------- */
const PackagingPlanner: React.FC<{
  order: ManufacturingOrder;
  setOrder: (o: ManufacturingOrder) => void;
  products: Product[];
  inventory: InventoryItem[];
}> = ({ order, setOrder, products, inventory }) => {
  const packaging = useMemo(
    () => products.filter((p) => p.category === 'Packaging'),
    [products]
  );

  const required = useMemo(() => {
    // Ensure branchId exists and is valid before filtering inventory
    const branchId = order.branchId ? Number(order.branchId) : null;
    
    return order.packagingItems.map((item) => ({
      ...item,
      required: item.qtyPerUnit * order.unitsRequested,
      available: branchId ? 
        inventory.find(
          (i) => i.productId === item.productId && Number(i.branchId) === branchId
        )?.quantity || 0 : 0,
    }));
  }, [order.packagingItems, order.unitsRequested, order.branchId, inventory]);

  const handleLine = (index: number, field: keyof PackagingItem, value: any) => {
    const items = [...order.packagingItems];
    if (field === 'productId') {
      const prod = packaging.find((p) => p.id === Number(value));
      items[index] = { ...items[index], productId: Number(value), name: prod?.name || '' };
    } else if (field === 'qtyPerUnit') {
      items[index].qtyPerUnit = Number(value);
    }
    setOrder({ ...order, packagingItems: items });
  };

  const addLine = () =>
    setOrder({
      ...order,
      packagingItems: [...order.packagingItems, { productId: 0, name: '', qtyPerUnit: 1 }],
    });

  const removeLine = (index: number) =>
    setOrder({
      ...order,
      packagingItems: order.packagingItems.filter((_, i) => i !== index),
    });

  return (
    <div className="table-wrapper manufacturing-table-wrapper">
      <table className="manufacturing-table">
        <thead>
          <tr>
            <th>مادة التغليف</th>
            <th style={{ width: '120px' }}>الكمية/وحدة</th>
            <th style={{ width: '120px' }}>المطلوب</th>
            <th>المتاح</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {required.map((item, idx) => {
            const enough = item.available >= item.required;
            const prod = packaging.find((p) => Number(p.id) === item.productId);
            return (
              <tr
                key={idx}
                style={{ backgroundColor: !enough ? 'var(--highlight-low-stock)' : 'transparent' }}
              >
                <td style={{ padding: '0.5rem' }}>
                  <select
                    value={item.productId}
                    onChange={(e) => handleLine(idx, 'productId', e.target.value)}
                    className="form-select manufacturing-select"
                  >
                    <option value={0}>اختر...</option>
                    {packaging.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <input
                    type="number"
                    value={item.qtyPerUnit}
                    onChange={(e) => handleLine(idx, 'qtyPerUnit', e.target.value)}
                    className="form-input manufacturing-input"
                  />
                </td>
                <td>{item.required}</td>
                <td>{item.available}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    style={{
                      color: '#ef4444',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                    }}
                  >
                    <TrashIcon style={{ width: '20px', height: '20px' }} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ marginTop: '1rem', textAlign: 'left' }}>
        <button type="button" onClick={addLine} className="btn btn-ghost manufacturing-button">
          <PlusIcon style={{ width: '20px', height: '20px' }} /> إضافة مادة تغليف
        </button>
      </div>
    </div>
  );
};

/* ------------------------------- COSTING -------------------------------- */
const CostingSection: React.FC<{
  costs: ManufacturingOrder['costs'];
  setCosts: (c: ManufacturingOrder['costs']) => void;
}> = ({ costs, setCosts }) => {
  const handle = (field: keyof ManufacturingOrder['costs'], value: number) => {
    setCosts({ ...costs, [field]: value });
  };

  return (
    <FormRow>
      <FormField label="تكلفة العمالة">
        <input
          type="number"
          value={costs.labor || ''}
          onChange={(e) => handle('labor', Number(e.target.value))}
          className="form-input manufacturing-input"
        />
      </FormField>

      <FormField label="تكاليف غير مباشرة">
        <input
          type="number"
          value={costs.overhead || ''}
          onChange={(e) => handle('overhead', Number(e.target.value))}
          className="form-input manufacturing-input"
        />
      </FormField>

      <FormField label="تكاليف أخرى">
        <input
          type="number"
          value={costs.other || ''}
          onChange={(e) => handle('other', Number(e.target.value))}
          className="form-input manufacturing-input"
        />
      </FormField>

      <FormField label="إجمالي التكلفة">
        <input
          type="text"
          value={`${costs.total.toFixed(3)} د.ك`}
          className="form-input manufacturing-input"
          disabled
        />
      </FormField>
    </FormRow>
  );
};

/* --------------------------- YIELD & SUMMARY ---------------------------- */
const YieldAndSummary: React.FC<{
  order: ManufacturingOrder;
  setOrder: (o: ManufacturingOrder) => void;
  onSave: () => void;
}> = ({ order, setOrder, onSave }) => {
  const handleYield = (field: 'actualMl' | 'actualUnits', value: number) =>
    setOrder({ ...order, yield: { ...order.yield, [field]: value } });

  return (
    <div>
      <FormRow>
        <FormField label="الناتج النظري (مل)">
          <input
            type="text"
            value={order.yield.theoreticalMl.toFixed(2)}
            className="form-input manufacturing-input"
            disabled
          />
        </FormField>

        <FormField label="الناتج المتوقع (مل)">
          <input
            type="text"
            value={order.yield.expectedMl.toFixed(2)}
            className="form-input manufacturing-input"
            disabled
          />
        </FormField>

        <FormField label="الناتج الفعلي (مل)">
          <input
            type="number"
            value={order.yield.actualMl || ''}
            onChange={(e) => handleYield('actualMl', Number(e.target.value))}
            className="form-input manufacturing-input"
          />
        </FormField>
      </FormRow>

      <FormRow>
        <FormField label="الوحدات المتوقعة (زجاجة)">
          <input
            type="text"
            value={order.yield.expectedUnits}
            className="form-input manufacturing-input"
            disabled
          />
        </FormField>

        <FormField label="الوحدات الفعلية (زجاجة)">
          <input
            type="number"
            value={order.yield.actualUnits || ''}
            onChange={(e) => handleYield('actualUnits', Number(e.target.value))}
            className="form-input manufacturing-input"
          />
        </FormField>

        <FormField label="نسبة الإنتاجية (%)">
          <input
            type="text"
            value={`${order.yield.yieldPercentage?.toFixed(2) ?? '0'}%`}
            className="form-input manufacturing-input"
            disabled
            style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}
          />
        </FormField>
      </FormRow>

      <div
        style={{
          marginTop: '1.5rem',
          borderTop: '1px solid var(--surface-border)',
          paddingTop: '1.5rem',
          textAlign: 'right',
        }}
      >
        <button onClick={onSave} className="btn btn-secondary manufacturing-button">
          حفظ أمر التصنيع
        </button>
      </div>
    </div>
  );
};

export default ManufacturingOrderPage;