const express = require('express');
const router = express.Router();
const taskController = require('../controller/taskAuth');
const { uploadTask } = require('../utils/multerConfig');


// router.post('/tasks',task_upload.array("taskImages",5) ,taskController.createTask);
router.post('/tasks', uploadTask.array("taskImages", 5), taskController.createTask);
router.get('/tasks', taskController.getAllTasks);
router.get('/tasks/:id', taskController.getTaskById);
router.get('/pros/search', taskController.searchTask);
router.put('/tasks/:id', uploadTask.array("taskImages", 5), taskController.updateTaskById);
router.delete('/tasks/:id', taskController.deleteTaskById);

router.get('/author', taskController.getTask)
// router.put('/author/:id', taskController.addTaskDescription);

router.put('/update/:id', taskController.updateTaskStatus)

router.get('/tasks-summary', taskController.getTasksSummaryByEmployee);


module.exports = router;
