const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// CSV upload route
router.post('/upload-csv', upload.single('csvFile'), productController.processCSV);

// Complete registration without CSV
router.post('/complete-registration', productController.completeRegistration);

// Get products (protected route)
router.get('/', auth, productController.getProducts);

// Get sales (protected route)
router.get('/sales', auth, productController.getSales);

// Get dashboard data (protected route)
router.get('/dashboard', auth, productController.getDashboardData);

module.exports = router;
