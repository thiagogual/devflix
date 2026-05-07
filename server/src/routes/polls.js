const express = require('express');
const router = express.Router();
const pollsController = require('../controllers/pollsController');
const { authMiddleware } = require('../middleware/auth');

// Public routes
router.get('/instance/:instanceId/active', pollsController.getActive);
router.post('/:id/vote', pollsController.vote);

// Protected routes
router.use(authMiddleware);

router.get('/instance/:instanceId', pollsController.getByInstance);
router.post('/', pollsController.create);
router.put('/:id', pollsController.update);
router.delete('/:id', pollsController.remove);

module.exports = router;
