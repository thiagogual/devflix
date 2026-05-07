const express = require('express');
const router = express.Router();
const classesController = require('../controllers/classesController');
const { authMiddleware } = require('../middleware/auth');

// Protected routes
router.use(authMiddleware);

router.get('/instance/:instanceId', classesController.getByInstance);
router.get('/:id', classesController.getById);
router.post('/', classesController.create);
router.put('/:id', classesController.update);
router.delete('/:id', classesController.remove);

module.exports = router;
