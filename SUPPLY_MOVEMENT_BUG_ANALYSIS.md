# Supply Movement supplyId Null Issue - Root Cause Analysis & Solution

## Problem Summary
`supplyId` is being saved as `null` in the database when creating supply movements, even though it's being selected in the UI form.

## Root Causes Identified

### 1. **Type Mismatch in Modal Callback**
**File**: `pages/SupplyMovementsPage.tsx` (lines 136-137)

```typescript
const handleSave = async (data: Omit<SupplyMovement, 'id' | 'date' | 'createdBy'>) => {
```

The page handler expects data WITHOUT `createdBy`, but the modal sends data WITH `createdBy`.

### 2. **Modal sends `createdBy: '1'` (placeholder)**
**File**: `components/SupplyMovementModal.tsx` (line 91)

```typescript
createdBy: '1', // Will be replaced in page with real user.id
```

This is a placeholder that doesn't match the user's actual ID.

### 3. **Redux Thunk Uses Wrong Endpoint Pattern**
**File**: `src/store/slices/supplyInventorySlice.ts` (lines 117-145)

The thunk uses `createSupplyMovement` from `supplyInventorySlice`, but it should be using the specialized thunks from `supplyMovementsSlice`.

### 4. **Two Different Redux Slices for Same Feature**
- `src/store/slices/supplyInventorySlice.ts` - Has `createSupplyMovement` 
- `src/store/slices/supplyMovementsSlice.ts` - Has `createSupplyInMovement` and `createSupplyOutMovement`

This creates confusion about which one to use.

## Complete Solution

### Step 1: Fix the Page Handler

**File**: `pages/SupplyMovementsPage.tsx`

Replace the `handleSave` function (lines 136-157) with:

```typescript
const handleSave = async (movement: Omit<SupplyMovement, 'id' | 'date'>) => {
  try {
    // Ensure all required fields are present
    if (!movement.supplyId || !movement.branchId) {
      throw new Error('المادة والفرع مطلوبان');
    }

    const movementData: Omit<SupplyMovement, 'id' | 'date'> = {
      ...movement,
      createdBy: user!.id, // Override with real user ID
      type: movement.type || 'IN', // Ensure type is set
    };

    // Use the correct Redux action based on movement type
    if (movementData.type === 'IN') {
      await dispatch(createSupplyInMovement(movementData)).unwrap();
    } else if (movementData.type === 'OUT') {
      await dispatch(createSupplyOutMovement(movementData)).unwrap();
    } else {
      // For TRANSFER and ADJUSTMENT, use the generic thunk
      await dispatch(createSupplyMovement(movementData)).unwrap();
    }

    addToast('تمت إضافة الحركة بنجاح', 'success');
    setModalOpen(false);
  } catch (e: any) {
    addToast(e?.message ?? 'فشل في إضافة الحركة', 'error');
  }
};
```

### Step 2: Update the Page Imports

**File**: `pages/SupplyMovementsPage.tsx` (lines 7-16)

Replace the imports with:

```typescript
import {
  createSupplyMovement,
} from '../src/store/slices/supplyInventorySlice';
import { fetchSupplyChainItems } from '../src/store/slices/supplyChainItemsSlice';
import { fetchBranches } from '../src/store/slices/branchSlice';
import { 
  fetchSupplyMovements as fetchSupplyMovementsAction,
  importSupplyMovements as importSupplyMovementsAction,
  deleteSupplyMovement,
  createSupplyInMovement,
  createSupplyOutMovement,
} from '../src/store/slices/supplyMovementsSlice';
```

### Step 3: Fix the Modal Callback Type

**File**: `components/SupplyMovementModal.tsx` (line 7)

Update the interface to match the page handler:

```typescript
interface SupplyMovementModalProps {
  onClose: () => void;
  onSave: (movement: Omit<SupplyMovement, 'id' | 'date'>) => void;  // Include createdBy
  supplies: SupplyChainItem[];
  branches: Branch[];
}
```

The modal should NOT remove `createdBy` since the page will override it anyway.

### Step 4: Fix Modal onSave Call

**File**: `components/SupplyMovementModal.tsx` (line 96)

The modal payload at lines 85-94 is already correct. Just verify that it includes all required fields:

```typescript
const payload: Omit<SupplyMovement, 'id' | 'date'> = {
  supplyId,                              // ✓ Must be included
  branchId,                              // ✓ Must be included
  type: formData.type,                   // ✓ Must be included
  quantity: qty,                         // ✓ Must be included
  notes: formData.notes?.trim() ?? '',   // ✓ Included
  createdBy: '1',                        // This will be overridden in page
  ...(formData.referenceType && { referenceType: formData.referenceType }),
  ...(formData.referenceId && { referenceId: formData.referenceId.trim() }),
};
```

### Step 5: Verify Redux Thunk is Sending Correct Data

**File**: `src/store/slices/supplyInventorySlice.ts` (lines 125-140)

The current implementation is:

```typescript
export const createSupplyMovement = createAsyncThunk(
  'supplyInventory/createMovement',
  async (movement: Omit<SupplyMovement, 'id' | 'date'>, { dispatch, rejectWithValue }) => {
    try {
      const { supplyId, branchId, ...rest } = movement;
      const payload = {
        supplyId: supplyId,
        branchId: branchId,
        ...rest,
      };
```

**ISSUE**: This removes `supplyId` and `branchId` from the payload if they're undefined. Add validation:

```typescript
export const createSupplyMovement = createAsyncThunk(
  'supplyInventory/createMovement',
  async (movement: Omit<SupplyMovement, 'id' | 'date'>, { dispatch, rejectWithValue }) => {
    try {
      // Validate required fields
      if (!movement.supplyId || !movement.branchId) {
        throw new Error('supplyId and branchId are required');
      }

      const payload = {
        supplyId: String(movement.supplyId),
        branchId: String(movement.branchId),
        type: movement.type,
        quantity: movement.quantity,
        notes: movement.notes,
        createdBy: movement.createdBy,
        ...(movement.referenceType && { referenceType: movement.referenceType }),
        ...(movement.referenceId && { referenceId: movement.referenceId }),
      };

      console.log('[DEBUG] Sending supply movement payload:', payload); // Add logging

      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MOVEMENTS}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('[ERROR] Backend response:', errorText);
        throw new Error(errorText || 'Failed to create movement');
      }

      const newMovement = await res.json();
      dispatch(addMovement(newMovement));
      return newMovement;
    } catch (err: any) {
      console.error('[ERROR] createSupplyMovement:', err);
      return rejectWithValue(err.message);
    }
  }
);
```

## Debugging Steps

1. **Add Console Logging**: 
   - In modal: Log `formData.supplyId` before creating payload
   - In page handler: Log `movementData` before dispatching
   - In Redux thunk: Log the payload being sent to backend

2. **Check Network Tab**:
   - Open DevTools → Network tab
   - Create a supply movement
   - Check the POST request to `/api/supply-movements/receive`
   - Verify `supplyId` is in the request body

3. **Check Browser Console**:
   - Look for any errors in the console
   - Check if the Redux thunk is being called

4. **Backend Validation**:
   - Check `backend/routes/supplyMovements.js` line 20-21
   - The backend logs `console.log(req.body)` - check server console for what's received

## Expected Behavior After Fix

1. User selects a supply item from dropdown
2. User fills in quantity and other details
3. User clicks save
4. Modal sends payload with `supplyId` set to selected item's ID
5. Page handler receives data and adds real `createdBy` (user ID)
6. Redux thunk validates and sends to backend
7. Backend validates and saves with `supplyId` and `branchId` populated
8. Database record shows proper `supplyId` instead of null

## Files to Modify

- ✅ `pages/SupplyMovementsPage.tsx` - handleSave function and imports
- ✅ `components/SupplyMovementModal.tsx` - Type definition
- ✅ `src/store/slices/supplyInventorySlice.ts` - Add validation and logging
