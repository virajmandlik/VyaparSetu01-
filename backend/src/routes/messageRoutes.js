const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Send message
router.post('/', messageController.sendMessage);

// Get messages for a partnership
router.get('/partnership/:id', messageController.getMessages);

module.exports = router;
