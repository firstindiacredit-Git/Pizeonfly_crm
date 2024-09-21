const express = require('express');
const router = express.Router();
const projectController = require('../controller/projectAuth');
const { project_upload } = require('../utils/multerConfig');

router.post('/projects', project_upload.array('projectImage', 10), projectController.createProject);
router.get('/projects', projectController.getAllProjects);
router.get('/projects/:projectId', projectController.getProjectById);
router.get('/pro/search', projectController.searchProjects);
router.put('/projects/:projectId', project_upload.array("projectImage",10), projectController.updateProject);
router.delete('/projects/:projectId', projectController.deleteProject);

router.get('/auth', projectController.getProject)
router.get('/auth-task', projectController.getProjecttask)
router.get('/totalProjects', projectController.getTotalProjects);

module.exports = router;
