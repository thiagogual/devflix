const express = require('express');
const router = express.Router();
const schedulesController = require('../controllers/schedulesController');
const { authMiddleware } = require('../middleware/auth');

// Protected routes
router.use(authMiddleware);

router.get('/instance/:instanceId', schedulesController.getByInstance);
router.post('/', schedulesController.create);
router.put('/:id', schedulesController.update);
router.delete('/:id', schedulesController.remove);
router.put('/instance/:instanceId', schedulesController.updateByInstance);

module.exports = router;
