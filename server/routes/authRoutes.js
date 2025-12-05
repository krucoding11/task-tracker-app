// In your Node.js backend: src/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController.js');
const { protect } = require('../middleware/authMiddleware.js');

router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
