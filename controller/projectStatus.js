const express = require('express');
const router = express.Router();
const Status = require('../model/projectStatusModel');
const jwt = require('jsonwebtoken');

// Create a new project status
router.post('/project-status', async (req, res) => {
    try {
        const { currentStatus, user_id, project_id } = req.body;
        const newProjectStatus = new Status({ currentStatus, user_id, project_id });
        await newProjectStatus.save();
        res.status(201).json(newProjectStatus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all project statuses
router.get('/project-status', async (req, res) => {
    try {
        const projectStatuses = await Status.find().populate("user_id");
        res.json(projectStatuses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get project status by project ID
router.get('/project-status/:project_id', async (req, res) => {
    try {
        const projectStatus = await Status.find({ project_id: req.params.project_id }).populate("user_id");
        if (!projectStatus.length) {
            return res.status(404).json({ message: "Project status not found" });
        }
        res.json(projectStatus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete project status
router.delete('/project-status/:id', async (req, res) => {
    try {
        const deletedProjectStatus = await Status.findByIdAndDelete(req.params.id);
        if (!deletedProjectStatus) {
            return res.status(404).json({ message: 'Project status not found' });
        }
        res.json({ message: 'Project status deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get project statuses by Token (for the assigned person)
router.get('/status-token', async (req, res) => {
    const auth = req.headers.authorization;
    const decodedToken = jwt.decode(auth);

    try {
        if (!decodedToken || !decodedToken.user_id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const status = await Status.find({ user_id: decodedToken.user_id }).populate("user_id");
        res.json(status);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;