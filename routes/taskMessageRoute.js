const express = require('express');
const router = express.Router();
const taskMessageController = require('../controller/taskMessage');

// Route to create a new task message
router.post('/task-message', taskMessageController.createTaskMessage);

// Route to get all task messages
router.get('/task-message', taskMessageController.getAllTaskMessages);

// Route to get a task message by ID
router.get('/task-messages/:task_id', taskMessageController.getTaskMessageById);

// Route to update a task message
router.put('/task-message/:id', taskMessageController.updateTaskMessage);

// Route to delete a task message
router.delete('/task-message/:id', taskMessageController.deleteTaskMessage);

module.exports = router;
