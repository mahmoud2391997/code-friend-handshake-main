import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import routes
import inventoryRoutes from './routes/inventoryRoutes';
import movementRoutes from './routes/movementRoutes';
import adjustmentRoutes from './routes/adjustmentRoutes';
import branchRoutes from './routes/branchRoutes';
import supplyChainRoutes from './routes/supplyChainRoutes';
import manufacturingOrderRoutes from './routes/manufacturingOrderRoutes';
import supplyMovementRoutes from './routes/supplyMovementRoutes';
import productRoutes from './routes/productRoutes';
import requisitionRoutes from './routes/requisitionRoutes';
import voucherRoutes from './routes/voucherRoutes';
import stockMovementRoutes from './routes/stockMovementRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4100;

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Body:', req.body);
  next();
});

// 添加:CORS middleware for port 8080
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erp_system')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/movements', movementRoutes);
app.use('/api/adjustments', adjustmentRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/supply-chain', supplyChainRoutes);
app.use('/api/manufacturing-orders', manufacturingOrderRoutes);
app.use('/api/supply-movements', supplyMovementRoutes);
app.use('/api/requisitions', requisitionRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/stock-movements', stockMovementRoutes);
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
  res.send('ERP System API');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
