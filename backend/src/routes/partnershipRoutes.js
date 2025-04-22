const express = require('express');
const router = express.Router();
const partnershipController = require('../controllers/partnershipController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Create partnership request (retailer to seller)
router.post('/request', partnershipController.createPartnershipRequest);

// Update partnership status (seller)
router.put('/:id/status', partnershipController.updatePartnershipStatus);

// Get all partnerships for a user (both seller and retailer)
router.get('/', partnershipController.getPartnerships);

// Get available sellers for partnerships (for retailers)
router.get('/available-sellers', partnershipController.getAvailableSellers);

// Get partnership details
router.get('/:id', partnershipController.getPartnershipDetails);

module.exports = router;
