const express = require('express');
const router = express.Router();
const instancesController = require('../controllers/instancesController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Public routes
router.get('/path/:path', instancesController.getByPath);

// Protected routes
router.use(authMiddleware);

router.get('/', instancesController.getAll);
router.get('/:id', instancesController.getById);
router.post('/', instancesController.create);
router.put('/:id', instancesController.update);
router.post('/:id/duplicate', instancesController.duplicate);

// Admin only
router.delete('/:id', adminMiddleware, instancesController.remove);

module.exports = router;
