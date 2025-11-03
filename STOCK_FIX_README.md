# Fix for Zero Stock Issue

## Problem
All inventory items show 0 stock because the database is empty and the frontend was only using mock data.

## Solution
I've implemented several fixes:

### 1. Backend Fixes
- **Fixed inventory controller** to properly handle `currentStock` field
- **Added seed endpoint** at `POST /api/inventory/seed` to populate database with test data
- **Added seed script** in `backend/src/seedData.ts`

### 2. Frontend Fixes
- **Updated App.tsx** to fetch inventory from API instead of just using mock data
- **Added fallback logic** in Inventory.tsx to handle missing currentStock field
- **Added seed button** in inventory page for easy testing

### 3. How to Fix the Issue

#### Option 1: Use the Seed Button (Easiest)
1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `npm run dev`
3. Go to the Inventory page
4. Click the "تحميل بيانات تجريبية" (Load Test Data) button
5. The page will reload with proper stock values

#### Option 2: Use the Seed Script
1. Start the backend: `cd backend && npm run dev`
2. In another terminal, run: `cd backend && npm run seed`
3. Refresh the frontend

#### Option 3: Use the API Endpoint
1. Start the backend: `cd backend && npm run dev`
2. Make a POST request to: `http://localhost:4100/api/inventory/seed`
3. Refresh the frontend

### 4. Root Cause
The issue was caused by:
- Database being empty (no initial data)
- Frontend using mock data instead of fetching from API
- Mismatch between expected data structure (`currentStock` vs `quantity`)

### 5. Files Modified
- `backend/src/controllers/inventoryController.ts` - Added seed endpoint and fixed data handling
- `backend/src/routes/inventoryRoutes.ts` - Added seed route
- `backend/src/seedData.ts` - New seed script
- `backend/package.json` - Added seed script
- `App.tsx` - Updated to fetch from API
- `pages/Inventory.tsx` - Added fallback logic and seed button

After applying these fixes, all inventory items should show their proper stock levels instead of 0.