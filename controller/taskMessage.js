const TaskMessage = require('../model/taskMessageModel');

// Create a new task message
exports.createTaskMessage = async (req, res) => {
    try {
        const { currentMessage, user_id, task_id } = req.body;
        const taskMessage = new TaskMessage({ currentMessage, user_id, task_id });
        await taskMessage.save();
        res.status(201).json(taskMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all task messages
exports.getAllTaskMessages = async (req, res) => {
    try {
        const taskMessages = await TaskMessage.find().populate('user_id').populate('task_id');
        res.status(200).json(taskMessages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a task message by taskid
exports.getTaskMessageById = async (req, res) => {
    // console.log("Fetching task messages for task_id:", req.params.task_id);
    try {
        const taskMessage = await TaskMessage.find({ task_id: req.params.task_id }).populate('user_id').populate('task_id');
        if (!taskMessage || taskMessage.length === 0) {
            return res.status(404).json({ message: 'Task message not found' });
        }
        res.status(200).json(taskMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a task message
exports.updateTaskMessage = async (req, res) => {
    try {
        const { currentMessage, user_id, task_id } = req.body;
        const taskMessage = await TaskMessage.findByIdAndUpdate(
            req.params.id,
            { currentMessage, user_id, task_id },
            { new: true }
        ).populate('user_id').populate('task_id');
        if (!taskMessage) {
            return res.status(404).json({ message: 'Task message not found' });
        }
        res.status(200).json(taskMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a task message
exports.deleteTaskMessage = async (req, res) => {
    try {
        const taskMessage = await TaskMessage.findByIdAndDelete(req.params.id);
        if (!taskMessage) {
            return res.status(404).json({ message: 'Task message not found' });
        }
        res.status(200).json({ message: 'Task message deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
