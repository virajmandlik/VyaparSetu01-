const express = require('express');
const router = express.Router();
const productRequestController = require('../controllers/productRequestController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Create product request (retailer to seller)
router.post('/', productRequestController.createProductRequest);

// Update product request status (seller)
router.put('/:id/status', productRequestController.updateProductRequestStatus);

// Fulfill product request (seller)
router.post('/:id/fulfill', productRequestController.fulfillProductRequest);

// Get product requests (for both seller and retailer)
router.get('/', productRequestController.getProductRequests);

// Get product request details
router.get('/:id', productRequestController.getProductRequestDetails);

module.exports = router;
