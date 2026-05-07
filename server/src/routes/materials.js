const express = require('express');
const router = express.Router();
const materialsController = require('../controllers/materialsController');
const { authMiddleware } = require('../middleware/auth');

// Public route for processing scheduled unlocks (called by scheduler)
router.post('/process-unlocks', materialsController.processScheduledUnlocks);

// Protected routes
router.use(authMiddleware);

router.get('/instance/:instanceId', materialsController.getByInstance);
router.post('/', materialsController.create);
router.put('/:id', materialsController.update);
router.delete('/:id', materialsController.remove);
router.put('/instance/:instanceId', materialsController.updateByInstance);

module.exports = router;
