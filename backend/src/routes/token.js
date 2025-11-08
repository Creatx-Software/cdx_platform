const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');
const authenticate = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');

// Admin routes - MUST come before parameterized routes
router.get('/admin/all', authenticate, requireAdmin, tokenController.getAllTokensAdmin);

// Public routes - no authentication required
router.get('/', tokenController.getAllTokens);
router.get('/:id', tokenController.getTokenDetails);
router.get('/:id/stats', authenticate, requireAdmin, tokenController.getTokenStats);

// Admin routes - authentication and admin role required
router.post('/', authenticate, requireAdmin, tokenController.createToken);
router.put('/:id', authenticate, requireAdmin, tokenController.updateToken);
router.delete('/:id', authenticate, requireAdmin, tokenController.deactivateToken);
router.patch('/:id/activate', authenticate, requireAdmin, tokenController.activateToken);

module.exports = router;
