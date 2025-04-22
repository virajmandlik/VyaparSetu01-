const express = require('express');
const router = express.Router();
const forecastController = require('../controllers/forecastController');
const auth = require('../middleware/auth');

// All forecast routes require authentication
router.use(auth);

// Get sales forecast
router.get('/sales', forecastController.getSalesForecast);

// Get revenue forecast
router.get('/revenue', forecastController.getRevenueForecast);

// Get combined dashboard forecast
router.get('/dashboard', forecastController.getDashboardForecast);

module.exports = router;
