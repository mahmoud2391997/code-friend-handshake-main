# Quick Fixes for supplyId Null Issue

## Fix 1: Update SupplyMovementModal.tsx Type

**Location**: `components/SupplyMovementModal.tsx` line 7

```typescript
// BEFORE:
interface SupplyMovementModalProps {
  onClose: () => void;
  onSave: (movement: Omit<SupplyMovement, 'id' | 'date'>) => void;
  supplies: SupplyChainItem[];
  branches: Branch[];
}

// AFTER: Remove the createdBy placeholder
interface SupplyMovementModalProps {
  onClose: () => void;
  onSave: (movement: Omit<SupplyMovement, 'id' | 'date'>) => void;  // Keep as is
  supplies: SupplyChainItem[];
  branches: Branch[];
}

// And at line 91 in the payload:
// BEFORE:
createdBy: '1', // Will be replaced in page with real user.id

// AFTER:
createdBy: user?.id || '1', // Will be overridden in page handler
```

## Fix 2: Update SupplyMovementsPage.tsx Handler & Imports

**Location**: `pages/SupplyMovementsPage.tsx` lines 7-16 and 136-157

```typescript
// STEP A: Update imports (lines 7-16)
import {
  createSupplyMovement,
} from '../src/store/slices/supplyInventorySlice';
import { fetchSupplyChainItems } from '../src/store/slices/supplyChainItemsSlice';
import { fetchBranches } from '../src/store/slices/branchSlice';
import { 
  fetchSupplyMovements as fetchSupplyMovementsAction,
  importSupplyMovements as importSupplyMovementsAction,
  deleteSupplyMovement,
  createSupplyInMovement,  // ADD THIS
  createSupplyOutMovement,  // ADD THIS
} from '../src/store/slices/supplyMovementsSlice';

// STEP B: Replace handleSave function (lines 136-157)
const handleSave = async (movement: Omit<SupplyMovement, 'id' | 'date'>) => {
  try {
    // Validate required fields
    if (!movement.supplyId || !movement.branchId) {
      throw new Error('المادة والفرع مطلوبان');
    }

    console.log('[DEBUG] handleSave received movement:', movement); // Debug log

    const movementData: Omit<SupplyMovement, 'id' | 'date'> = {
      ...movement,
      createdBy: user!.id, // Override with real user ID
      type: movement.type as 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT',
    };

    console.log('[DEBUG] Dispatching movementData:', movementData); // Debug log

    // Use the correct thunk based on type
    const resultAction = 
      movementData.type === 'IN' 
        ? await dispatch(createSupplyInMovement(movementData)).unwrap()
        : movementData.type === 'OUT'
        ? await dispatch(createSupplyOutMovement(movementData)).unwrap()
        : await dispatch(createSupplyMovement(movementData)).unwrap();

    console.log('[DEBUG] API Response:', resultAction); // Debug log
    
    addToast('تمت إضافة الحركة بنجاح', 'success');
    setModalOpen(false);
  } catch (e: any) {
    console.error('[ERROR] handleSave failed:', e); // Debug log
    addToast(e?.message ?? 'فشل في إضافة الحركة', 'error');
  }
};
```

## Fix 3: Add Validation to Redux Thunk

**Location**: `src/store/slices/supplyInventorySlice.ts` lines 117-145

```typescript
export const createSupplyMovement = createAsyncThunk(
  'supplyInventory/createMovement',
  async (movement: Omit<SupplyMovement, 'id' | 'date'>, { dispatch, rejectWithValue }) => {
    try {
      // ADD THIS VALIDATION
      if (!movement.supplyId) {
        console.error('[ERROR] Missing supplyId:', movement);
        throw new Error('supplyId is required');
      }
      if (!movement.branchId) {
        console.error('[ERROR] Missing branchId:', movement);
        throw new Error('branchId is required');
      }

      const payload = {
        supplyId: String(movement.supplyId),
        branchId: String(movement.branchId),
        type: movement.type,
        quantity: movement.quantity,
        notes: movement.notes || '',
        createdBy: movement.createdBy,
        ...(movement.referenceType && { referenceType: movement.referenceType }),
        ...(movement.referenceId && { referenceId: movement.referenceId }),
      };

      console.log('[DEBUG] Payload being sent to backend:', payload);

      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MOVEMENTS}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('[ERROR] Backend returned error:', res.status, errorText);
        throw new Error(errorText || `Backend error: ${res.status}`);
      }

      const newMovement = await res.json();
      console.log('[DEBUG] Movement created successfully:', newMovement);
      dispatch(addMovement(newMovement));
      return newMovement;
    } catch (err: any) {
      console.error('[ERROR] createSupplyMovement exception:', err);
      return rejectWithValue(err.message);
    }
  }
);
```

## Testing the Fix

1. **Check the browser console** for debug logs showing:
   - `[DEBUG] handleSave received movement: {supplyId: "...", ...}`
   - `[DEBUG] Dispatching movementData: {...}`
   - `[DEBUG] Payload being sent to backend: {...}`
   - `[DEBUG] Movement created successfully: {...}`

2. **Check the Network tab**:
   - POST request to `/api/supply-movements/receive`
   - Request body should include `supplyId` (not null)

3. **Check server logs**:
   - `backend/routes/supplyMovements.js` line 21 logs `console.log(req.body)`
   - Should show `supplyId` in the output

## Expected Behavior
After applying these fixes:
- ✅ `supplyId` will be properly passed from modal to page
- ✅ Page will validate it exists before dispatching
- ✅ Redux thunk will validate and log it
- ✅ Backend will receive non-null `supplyId`
- ✅ Database record will have proper `supplyId` instead of null
