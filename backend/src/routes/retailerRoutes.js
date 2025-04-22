const express = require('express');
const router = express.Router();
const retailerController = require('../controllers/retailerController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get retailer inventory
router.get('/inventory', retailerController.getInventory);

// Update retailer inventory item
router.put('/inventory/:id', retailerController.updateInventoryItem);

// Record a sale
router.post('/sales', retailerController.recordSale);

// Get sales data
router.get('/sales', retailerController.getSales);

// Get sales forecast
router.get('/forecast', retailerController.getForecast);

// Test add inventory item (for debugging)
router.post('/test-add-inventory', retailerController.testAddInventoryItem);

// Get dashboard data
router.get('/dashboard', retailerController.getDashboardData);

module.exports = router;
