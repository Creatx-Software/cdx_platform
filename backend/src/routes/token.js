const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');

// Get current token price
router.get('/price', tokenController.getTokenPrice);

// Get token configuration details
router.get('/config', tokenController.getTokenConfig);

module.exports = router;