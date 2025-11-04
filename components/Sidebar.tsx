import React, { useState } from 'react';
import { Role } from '../types';

// Define proper icon components
const HomeIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const UserIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const DocumentTextIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ChevronDownIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const DesktopComputerIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const CubeIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const BeakerIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const TruckIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CollectionIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const SafeIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const UsersIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const HierarchyIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
  </svg>
);

const CalendarIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ChartBarIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const CogIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  lowStockCount: number;
  pendingLeavesCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isSuperAdmin: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  setActiveView, 
  lowStockCount, 
  pendingLeavesCount,
  isCollapsed,
  onToggleCollapse,
  isSuperAdmin
}) => {
  const [isOpen, setIsOpen] = useState(activeView.startsWith('Dashboard'));

  const handleClick = (view: string) => {
    setActiveView(view);
    setIsOpen(view === 'Dashboard');
  };

  return (
    <aside className={`sidebar-container glass-pane ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">A</div>
        {!isCollapsed && <h1 className="sidebar-title">ASAS System</h1>}
      </div>
      <ul className="sidebar-nav">
        <li className="nav-item">
          <button
            className={`nav-link ${activeView === 'Dashboard' ? 'active' : ''}`}
            onClick={() => handleClick('Dashboard')}
            title={isCollapsed ? 'لوحة التحكم' : undefined}
          >
            <div className="nav-link-content">
              <HomeIcon className="icon" />
              {!isCollapsed && <span>لوحة التحكم</span>}
            </div>
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeView === 'MyProfile' ? 'active' : ''}`}
            onClick={() => handleClick('MyProfile')}
            title={isCollapsed ? 'ملفي الشخصي' : undefined}
          >
            <div className="nav-link-content">
              <UserIcon className="icon" />
              {!isCollapsed && <span>ملفي الشخصي</span>}
            </div>
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeView.startsWith('Sales') ? 'active' : ''}`}
            onClick={() => handleClick('Sales')}
            title={isCollapsed ? 'المبيعات' : undefined}
          >
            <div className="nav-link-content">
              <DocumentTextIcon className="icon" />
              {!isCollapsed && <span>المبيعات</span>}
            </div>
            {!isCollapsed && <ChevronDownIcon className="chevron" />}
          </button>
          {activeView.startsWith('Sales') && !isCollapsed && (
            <ul className="nav-submenu">
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Sales/Invoices')} className={activeView === 'Sales/Invoices' ? 'active' : ''}>
                  إدارة الفواتير
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Sales/Quotations')} className={activeView === 'Sales/Quotations' ? 'active' : ''}>
                  إدارة عروض الأسعار
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Sales/Returns')} className={activeView === 'Sales/Returns' ? 'active' : ''}>
                  الفواتير المرتجعة
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Sales/CreditNotes')} className={activeView === 'Sales/CreditNotes' ? 'active' : ''}>
                  الإشعارات الدائنة
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Sales/Recurring')} className={activeView === 'Sales/Recurring' ? 'active' : ''}>
                  الفواتير الدورية
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Sales/Payments')} className={activeView === 'Sales/Payments' ? 'active' : ''}>
                  مدفوعات العملاء
                </button>
              </li>
            </ul>
          )}
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeView.startsWith('POS') ? 'active' : ''}`}
            onClick={() => handleClick('POS')}
            title={isCollapsed ? 'نقاط البيع' : undefined}
          >
            <div className="nav-link-content">
              <DesktopComputerIcon className="icon" />
              {!isCollapsed && <span>نقاط البيع</span>}
            </div>
            {!isCollapsed && <ChevronDownIcon className="chevron" />}
          </button>
          {activeView.startsWith('POS') && !isCollapsed && (
            <ul className="nav-submenu">
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('POS/Start')} className={activeView === 'POS/Start' ? 'active' : ''}>
                  ببدأ البيع
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('POS/Sessions')} className={activeView === 'POS/Sessions' ? 'active' : ''}>
                  الجلسات
                </button>
              </li>
            </ul>
          )}
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeView === 'Customers' ? 'active' : ''}`}
            onClick={() => handleClick('Customers')}
            title={isCollapsed ? 'العملاء' : undefined}
          >
            <div className="nav-link-content">
              <UserIcon className="icon" />
              {!isCollapsed && <span>العملاء</span>}
            </div>
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeView.startsWith('Inventory') ? 'active' : ''}`}
            onClick={() => handleClick('Inventory')}
            title={isCollapsed ? 'المخزون' : undefined}
          >
            <div className="nav-link-content">
              <CubeIcon className="icon" />
              {!isCollapsed && <span>المخزون</span>}
            </div>
            {!isCollapsed && <ChevronDownIcon className="chevron" />}
          </button>
          {activeView.startsWith('Inventory') && !isCollapsed && (
            <ul className="nav-submenu">
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Inventory/Products')} className={activeView === 'Inventory/Products' ? 'active' : ''}>
                  إدارة المنتجات
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Inventory/Vouchers')} className={activeView === 'Inventory/Vouchers' ? 'active' : ''}>
                  إدارة الإذون المخزنية
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Inventory/Requisitions')} className={activeView === 'Inventory/Requisitions' ? 'active' : ''}>
                  الطلبيات المخزنية
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Inventory/Tracking')} className={activeView === 'Inventory/Tracking' ? 'active' : ''}>
                  تتبع المنتجات
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Inventory/Pricelists')} className={activeView === 'Inventory/Pricelists' ? 'active' : ''}>
                  قوائم الأسعار
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Branches')} className={activeView === 'Branches' ? 'active' : ''}>
                  المستودعات
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Inventory/Stocktakes')} className={activeView === 'Inventory/Stocktakes' ? 'active' : ''}>
                  إدارة الجرد
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Settings/Inventory')} className={activeView === 'Settings/Inventory' ? 'active' : ''}>
                  إعدادات المخزون
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Settings/Products')} className={activeView === 'Settings/Products' ? 'active' : ''}>
                  إعدادات المنتجات
                </button>
              </li>
            </ul>
          )}
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeView.startsWith('Manufacturing') ? 'active' : ''}`}
            onClick={() => handleClick('Manufacturing')}
            title={isCollapsed ? 'التصنيع' : undefined}
          >
            <div className="nav-link-content">
              <BeakerIcon className="icon" />
              {!isCollapsed && <span>التصنيع</span>}
            </div>
            {!isCollapsed && <ChevronDownIcon className="chevron" />}
          </button>
          {activeView.startsWith('Manufacturing') && !isCollapsed && (
            <ul className="nav-submenu">
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Manufacturing/Orders')} className={activeView === 'Manufacturing/Orders' ? 'active' : ''}>
                  أوامر التصنيع
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Manufacturing/Tasks')} className={activeView === 'Manufacturing/Tasks' ? 'active' : ''}>
                  مهام التصنيع
                </button>
              </li>
            </ul>
          )}
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeView.startsWith('Purchases') ? 'active' : ''}`}
            onClick={() => handleClick('Purchases')}
            title={isCollapsed ? 'المشتريات' : undefined}
          >
            <div className="nav-link-content">
              <TruckIcon className="icon" />
              {!isCollapsed && <span>المشتريات</span>}
            </div>
            {!isCollapsed && <ChevronDownIcon className="chevron" />}
          </button>
          {activeView.startsWith('Purchases') && !isCollapsed && (
            <ul className="nav-submenu">
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Purchases/Suppliers')} className={activeView === 'Purchases/Suppliers' ? 'active' : ''}>
                  إدارة الموردين
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Purchases/Requests')} className={activeView === 'Purchases/Requests' ? 'active' : ''}>
                  طلبات الشراء
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Purchases/RFQs')} className={activeView === 'Purchases/RFQs' ? 'active' : ''}>
                  طلبات عروض الأسعار
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Purchases/Quotations')} className={activeView === 'Purchases/Quotations' ? 'active' : ''}>
                  عروض أسعار الموردين
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Purchases/Orders')} className={activeView === 'Purchases/Orders' ? 'active' : ''}>
                  أوامر الشراء
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Purchases/Invoices')} className={activeView === 'Purchases/Invoices' ? 'active' : ''}>
                  فواتير الشراء
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Purchases/Returns')} className={activeView === 'Purchases/Returns' ? 'active' : ''}>
                  مرتجعات المشتريات
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Purchases/DebitNotes')} className={activeView === 'Purchases/DebitNotes' ? 'active' : ''}>
                  الإشعارات المدينة
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Purchases/Payments')} className={activeView === 'Purchases/Payments' ? 'active' : ''}>
                  مدفوعات الموردين
                </button>
              </li>
            </ul>
          )}
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeView.startsWith('Supplies') ? 'active' : ''}`}
            onClick={() => handleClick('Supplies')}
            title={isCollapsed ? 'سلسلة التوريد' : undefined}
          >
            <div className="nav-link-content">
              <CollectionIcon className="icon" />
              {!isCollapsed && <span>سلسلة التوريد</span>}
            </div>
            {!isCollapsed && <ChevronDownIcon className="chevron" />}
          </button>
          {activeView.startsWith('Supplies') && !isCollapsed && (
            <ul className="nav-submenu">
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Supplies/Materials')} className={activeView === 'Supplies/Materials' ? 'active' : ''}>
                التوريدات
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Supplies/Distribution')} className={activeView === 'Supplies/Distribution' ? 'active' : ''}>
                التوزيع للمستودعات
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Supplies/Movements')} className={activeView === 'Supplies/Movements' ? 'active' : ''}>
                حركات المواد
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Supplies/Orders')} className={activeView === 'Supplies/Orders' ? 'active' : ''}>
                طلبات التوريد
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Supplies/Suppliers')} className={activeView === 'Supplies/Suppliers' ? 'active' : ''}>
                موردي المواد
                </button>
              </li>
            </ul>
          )}
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeView.startsWith('Finance') ? 'active' : ''}`}
            onClick={() => handleClick('Finance')}
            title={isCollapsed ? 'المالية' : undefined}
          >
            <div className="nav-link-content">
              <SafeIcon className="icon" />
              {!isCollapsed && <span>المالية</span>}
            </div>
            {!isCollapsed && <ChevronDownIcon className="chevron" />}
          </button>
          {activeView.startsWith('Finance') && !isCollapsed && (
            <ul className="nav-submenu">
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Finance/Expenses')} className={activeView === 'Finance/Expenses' ? 'active' : ''}>
                  المصروفات
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Finance/Accounts')} className={activeView === 'Finance/Accounts' ? 'active' : ''}>
                  خزائن وحسابات بنكية
                </button>
              </li>
            </ul>
          )}
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeView.startsWith('Ledger') ? 'active' : ''}`}
            onClick={() => handleClick('Ledger')}
            title={isCollapsed ? 'الحسابات العامة' : undefined}
          >
            <div className="nav-link-content">
              <CollectionIcon className="icon" />
              {!isCollapsed && <span>الحسابات العامة</span>}
            </div>
            {!isCollapsed && <ChevronDownIcon className="chevron" />}
          </button>
          {activeView.startsWith('Ledger') && !isCollapsed && (
            <ul className="nav-submenu">
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Ledger/Journal')} className={activeView === 'Ledger/Journal' ? 'active' : ''}>
                  القيود اليومية
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Ledger/ChartOfAccounts')} className={activeView === 'Ledger/ChartOfAccounts' ? 'active' : ''}>
                  دليل الحسابات
                </button>
              </li>
            </ul>
          )}
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeView.startsWith('HR') ? 'active' : ''}`}
            onClick={() => handleClick('HR')}
            title={isCollapsed ? 'الموارد البشرية' : undefined}
          >
            <div className="nav-link-content">
              <UsersIcon className="icon" />
              {!isCollapsed && <span>الموارد البشرية</span>}
            </div>
            {!isCollapsed && <ChevronDownIcon className="chevron" />}
          </button>
          {activeView.startsWith('HR') && !isCollapsed && (
            <ul className="nav-submenu">
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('HR/Employees')} className={activeView === 'HR/Employees' ? 'active' : ''}>
                  ملفات الموظفين
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('HR/Attendance')} className={activeView === 'HR/Attendance' ? 'active' : ''}>
                  الحضور والانصراف
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('HR/LeaveRequests')} className={activeView === 'HR/LeaveRequests' ? 'active' : ''}>
                  إدارة الإجازات
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('HR/AdvanceRequests')} className={activeView === 'HR/AdvanceRequests' ? 'active' : ''}>
                  طلبات السلف
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('HR/GeneralRequests')} className={activeView === 'HR/GeneralRequests' ? 'active' : ''}>
                  الطلبات العامة
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('HR/Salaries')} className={activeView === 'HR/Salaries' ? 'active' : ''}>
                  الرواتب والكشوف
                </button>
              </li>
            </ul>
          )}
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeView.startsWith('Organization') ? 'active' : ''}`}
            onClick={() => handleClick('Organization')}
            title={isCollapsed ? 'المنظمة' : undefined}
          >
            <div className="nav-link-content">
              <HierarchyIcon className="icon" />
              {!isCollapsed && <span>المنظمة</span>}
            </div>
            {!isCollapsed && <ChevronDownIcon className="chevron" />}
          </button>
          {activeView.startsWith('Organization') && !isCollapsed && (
            <ul className="nav-submenu">
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Branches')} className={activeView === 'Branches' ? 'active' : ''}>
                  إدارة الفروع
                </button>
              </li>
            </ul>
          )}
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeView.startsWith('Renewals') ? 'active' : ''}`}
            onClick={() => handleClick('Renewals')}
            title={isCollapsed ? 'التجديدات والتراخيص' : undefined}
          >
            <div className="nav-link-content">
              <CalendarIcon className="icon" />
              {!isCollapsed && <span>التجديدات والتراخيص</span>}
            </div>
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeView.startsWith('Reports') ? 'active' : ''}`}
            onClick={() => handleClick('Reports')}
            title={isCollapsed ? 'التقارير' : undefined}
          >
            <div className="nav-link-content">
              <ChartBarIcon className="icon" />
              {!isCollapsed && <span>التقارير</span>}
            </div>
            {!isCollapsed && <ChevronDownIcon className="chevron" />}
          </button>
          {activeView.startsWith('Reports') && !isCollapsed && (
            <ul className="nav-submenu">
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Reports/Summary')} className={activeView === 'Reports/Summary' ? 'active' : ''}>
                  ملخص
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Reports/Sales')} className={activeView === 'Reports/Sales' ? 'active' : ''}>
                  المبيعات
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Reports/BrandPerformance')} className={activeView === 'Reports/BrandPerformance' ? 'active' : ''}>
                  أداء العلامات التجارية
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Reports/BranchSales')} className={activeView === 'Reports/BranchSales' ? 'active' : ''}>
                  مبيعات الفروع
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Reports/Products')} className={activeView === 'Reports/Products' ? 'active' : ''}>
                  مبيعات المنتجات
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Reports/Purchases')} className={activeView === 'Reports/Purchases' ? 'active' : ''}>
                  المشتريات
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Reports/Expenses')} className={activeView === 'Reports/Expenses' ? 'active' : ''}>
                  المصروفات
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Reports/Customers')} className={activeView === 'Reports/Customers' ? 'active' : ''}>
                  العملاء
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Reports/Accounts')} className={activeView === 'Reports/Accounts' ? 'active' : ''}>
                  الحسابات المالية
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Reports/Forecast')} className={activeView === 'Reports/Forecast' ? 'active' : ''}>
                  توقعات المبيعات (AI)
                </button>
              </li>
            </ul>
          )}
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeView.startsWith('Settings') ? 'active' : ''}`}
            onClick={() => handleClick('Settings')}
            title={isCollapsed ? 'الإعدادات' : undefined}
          >
            <div className="nav-link-content">
              <CogIcon className="icon" />
              {!isCollapsed && <span>الإعدادات</span>}
            </div>
            {!isCollapsed && <ChevronDownIcon className="chevron" />}
          </button>
          {activeView.startsWith('Settings') && !isCollapsed && (
            <ul className="nav-submenu">
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Settings/General')} className={activeView === 'Settings/General' ? 'active' : ''}>
                  عام
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Settings/Sales')} className={activeView === 'Settings/Sales' ? 'active' : ''}>
                  المبيعات
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Settings/Purchases')} className={activeView === 'Settings/Purchases' ? 'active' : ''}>
                  المشتريات
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Settings/Suppliers')} className={activeView === 'Settings/Suppliers' ? 'active' : ''}>
                  الموردين
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Users')} className={activeView === 'Users' ? 'active' : ''}>
                  المستخدمين
                </button>
              </li>
              <li className="nav-submenu-item">
                <button onClick={() => handleClick('Settings/Integrations')} className={activeView === 'Settings/Integrations' ? 'active' : ''}>
                  التكاملات
                </button>
              </li>
            </ul>
          )}
        </li>
        {isSuperAdmin && (
          <li className="nav-item">
            <button 
              className={`nav-link ${activeView === 'Admin' ? 'active' : ''}`}
              onClick={() => handleClick('Admin')}
            >
              <div className="nav-link-content">
                <CogIcon className="icon" />
                {!isCollapsed && <span>إدارة النظام</span>}
              </div>
            </button>
          </li>
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;