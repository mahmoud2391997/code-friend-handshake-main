
import React, { useState, useEffect } from 'react';
import InventoryTransferModal from '../components/InventoryTransferModal';
import { Branch, Product, InventoryItem } from '../types'; // Assuming types are defined

// Define a type for the movement data received from the API
interface ApiMovement {
  _id: string;
  item_name: string;
  movement_type: 'in' | 'out';
  quantity: number;
  reference_type: string;
  notes?: string;
  createdAt: string;
}

const StockMovementPage = () => {
  const [movements, setMovements] = useState<ApiMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const movementsRes = await fetch('/api/stock-movements');
        const productsRes = await fetch('/api/products');
        const branchesRes = await fetch('/api/branches');
        const inventoryRes = await fetch('/api/inventory');

        const movementsData = await movementsRes.json();
        console.log(movementsData);
        
        const productsData = await productsRes.json();
        const branchesData = await branchesRes.json();
        const inventoryData = await inventoryRes.json();

        // Correctly set state from direct API response array
        setMovements(Array.isArray(movementsData) ? movementsData : []);
        setProducts(productsData?.data || []);
        setBranches(branchesData?.data || []);
        setInventory(inventoryData?.data || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        // Set to empty array on failure to prevent crashes
        setMovements([]); 
        setProducts([]);
        setBranches([]);
        setInventory([]);
      }
    };

    fetchData();
  }, []);

  const handleTransfer = async (data: any) => {
    try {
      const transferData = {
        fromBranch: data.sourceBranchId,
        toBranch: data.destinationBranchId,
        productId: data.productId,
        quantity: data.quantity,
        notes: data.notes || ''
      };

      const res = await fetch('/api/stock-movements/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferData),
      });

      if (res.ok) {
        // Refetch movements to show the latest data
        const movementsRes = await fetch('/api/stock-movements');
        const movementsData = await movementsRes.json();
        setMovements(Array.isArray(movementsData) ? movementsData : []);
        setIsModalOpen(false);
      } else {
        const errorData = await res.json();
        alert(`Transfer failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Transfer error:", error);
      alert('An error occurred during the transfer.');
    }
  };

  return (
    <div className="page-container">
      <h1>سجل الحركات المخزنية</h1>

      <div className="flex justify-end mb-4">
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          إنشاء تحويل مخزني
        </button>
      </div>

      {isModalOpen && (
        <InventoryTransferModal
          onClose={() => setIsModalOpen(false)}
          onTransfer={handleTransfer}
          branches={branches}
          products={products}
          inventory={inventory}
        />
      )}

      <div className="movements-table glass-pane">
        <h2>سجل الحركات</h2>
        <table>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>المنتج</th>
              <th>الكمية</th>
              <th>نوع الحركة</th>
              <th>المرجع</th>
              <th>ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {movements.map(m => (
              <tr key={m._id}>
                <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                <td>{m.item_name}</td>
                <td>{m.quantity}</td>
                <td>{m.movement_type}</td>
                <td>{m.reference_type}</td>
                <td>{m.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockMovementPage;
