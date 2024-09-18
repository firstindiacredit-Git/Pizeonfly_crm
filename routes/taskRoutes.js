const express = require('express');
const router = express.Router();
const taskController = require('../controller/taskAuth');
const { task_upload } = require('../utils/multerConfig');


// router.post('/tasks',task_upload.array("taskImages",5) ,taskController.createTask);
router.post('/tasks', task_upload.array("taskImages", 5), taskController.createTask);
router.get('/tasks', taskController.getAllTasks);
router.get('/tasks/:id', taskController.getTaskById);
router.get('/pros/search', taskController.searchTask);
router.put('/tasks/:id', task_upload.array("taskImages", 5), taskController.updateTaskById);
router.delete('/tasks/:id', taskController.deleteTaskById);

router.get('/author', taskController.getTask)
// router.put('/author/:id', taskController.addTaskDescription);

router.put('/update/:id', taskController.updateTaskStatus)

router.get('/tasks-summary', taskController.getTasksSummaryByEmployee);


module.exports = router;
