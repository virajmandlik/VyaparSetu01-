const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const forecastRoutes = require('./routes/forecastRoutes');
const partnershipRoutes = require('./routes/partnershipRoutes');
const productRequestRoutes = require('./routes/productRequestRoutes');
const messageRoutes = require('./routes/messageRoutes');
const retailerRoutes = require('./routes/retailerRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/partnerships', partnershipRoutes);
app.use('/api/product-requests', productRequestRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/retailer', retailerRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});