const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const verifyToken = require('../middleware/auth.middleware');

router.post('/', verifyToken, projectController.createProject);
router.get('/', verifyToken, projectController.getProjects);
router.post('/:id/members', verifyToken, projectController.addMember);

module.exports = router;