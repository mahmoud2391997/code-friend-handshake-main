import React, { useContext, useRef, useState, useEffect } from 'react';
import { Role, Product } from '../types';
import { AuthContext } from '../App';

// Define these icon components
const XIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SearchIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// Define navigation items
const employeeNavItems = [
  { view: 'Dashboard', label: 'لوحة التحكم' },
  { view: 'MyProfile', label: 'ملفي الشخصي' },
  { view: 'Sales', label: 'المبيعات' },
  { view: 'POS', label: 'نقاط البيع' },
  { view: 'Customers', label: 'العملاء' },
];

const allNavItems = [
  { view: 'Dashboard', label: 'لوحة التحكم' },
  { view: 'MyProfile', label: 'ملفي الشخصي' },
  { view: 'Sales', label: 'المبيعات' },
  { view: 'POS', label: 'نقاط البيع' },
  { view: 'Customers', label: 'العملاء' },
  { view: 'Inventory', label: 'المخزون' },
  { view: 'Manufacturing', label: 'التصنيع' },
  { view: 'Purchases', label: 'المشتريات' },
  { view: 'Supplies', label: 'سلسلة التوريد' },
  { view: 'Finance', label: 'المالية' },
  { view: 'Ledger', label: 'الحسابات العامة' },
  { view: 'HR', label: 'الموارد البشرية' },
  { view: 'Organization', label: 'المنظمة' },
  { view: 'Renewals', label: 'التجديدات والتراخيص' },
  { view: 'Reports', label: 'التقارير' },
  { view: 'Settings', label: 'الإعدادات' },
];

// Simple implementation of DrawerNavGroup
const DrawerNavGroup: React.FC<any> = ({ item, activeView, setActiveView, onNavigate }) => (
  <li className="drawer-nav-item">
    <button 
      className={`drawer-nav-link ${activeView.startsWith(item.view) ? 'active' : ''}`}
      onClick={() => {
        setActiveView(item.view);
        onNavigate();
      }}
    >
      {item.label}
    </button>
  </li>
);

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  lowStockCount: number;
  pendingLeavesCount: number;
  products: Product[];
  onProductSelect: (product: Product) => void;
  isSuperAdmin: boolean;
}

const Drawer: React.FC<DrawerProps> = ({ 
  isOpen, 
  onClose, 
  activeView, 
  setActiveView, 
  lowStockCount, 
  pendingLeavesCount,
  products,
  onProductSelect,
  isSuperAdmin
}) => {
  const { user } = useContext(AuthContext);
  const drawerRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [startX, setStartX] = useState<number | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 1) {
      setSearchResults(
        products.filter(p => p.sku?.toLowerCase().includes(term.toLowerCase()))
      );
    } else {
      setSearchResults([]);
    }
  };

  const handleProductClick = (product: Product) => {
    onProductSelect(product);
    setSearchTerm('');
    setSearchResults([]);
    onClose();
  };

  const handleNavigate = () => {
    onClose();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startX) return;
    
    const currentX = e.touches[0].clientX;
    const diffX = currentX - startX;
    
    if (diffX > 50 && startX > window.innerWidth - 50) {
      onClose();
    }
  };

  const handleTouchEnd = () => {
    setStartX(null);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!user) return null;

  const navItems = user.role === Role.Employee ? employeeNavItems : allNavItems;

  return (
    <>
      <div 
        className={`drawer-backdrop ${isOpen ? 'open' : ''}`}
        onClick={handleBackdropClick}
      />
      
      <div 
        ref={drawerRef}
        className={`drawer ${isOpen ? 'open' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="drawer-header">
          <div className="drawer-header-top">
            <div className="drawer-logo-section">
              <div className="drawer-logo">F</div>
              <h1 className="drawer-title">ASAS System</h1>
            </div>
            <button className="drawer-close-btn" onClick={onClose}>
              <XIcon className="icon" />
            </button>
          </div>
          
          <div className="drawer-search-container">
            <div className="drawer-search-input-wrapper">
              <input
                type="text"
                placeholder="بحث بكود المنتج (SKU)..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="drawer-search-input"
              />
              <SearchIcon className="drawer-search-icon" />
            </div>
            {searchResults.length > 0 && (
              <div className="drawer-search-results">
                <ul>
                  {searchResults.map(p => (
                    <li key={p.id} onClick={() => handleProductClick(p)}>
                      <p className="product-name">{p.name}</p>
                      <p className="product-sku">{p.sku}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="drawer-content">
          <ul className="drawer-nav">
            {navItems.map(item => (
              <DrawerNavGroup
                key={item.view}
                item={item}
                activeView={activeView}
                setActiveView={setActiveView}
                onNavigate={handleNavigate}
                notificationCount={
                  item.view === 'Products' ? lowStockCount :
                  item.view === 'HR' ? pendingLeavesCount :
                  undefined
                }
              />
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Drawer;