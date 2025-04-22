const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected route example
router.get('/profile', auth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router; 