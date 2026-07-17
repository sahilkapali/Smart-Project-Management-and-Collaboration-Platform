const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const verifyToken = require('../middleware/auth.middleware');

router.post('/', verifyToken, taskController.createTask);
router.get('/project/:projectId', verifyToken, taskController.getProjectTasks);
router.patch('/:id/status', verifyToken, taskController.updateKanbanStatus);
router.post('/:id/comments', verifyToken, taskController.addTaskComment);

module.exports = router;