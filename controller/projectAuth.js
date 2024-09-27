const express = require('express');
const router = express.Router();
const Project = require('../model/projectModel');
const jwt = require('jsonwebtoken');
const Task = require('../model/taskModel');


// Total projects
exports.getTotalProjects = async (req, res) => {
    try {
        const totalProjects = await Project.countDocuments();
        res.json({ totalProjects });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new project
exports.createProject = async (req, res) => {
    try {
        // console.log(req.file);
        // const path = req.file?.path;
        const paths = req.files?.map(file => file.path);
        // console.log(path);
        // const newPath = path?.replace('uploads\\', "");
        const newPaths = paths?.map(path => path.replace('uploads\\', ""));

        // console.log(req.body, 'body');
        const taskAssigner = req.body.taskAssignPerson;
        // console.log(taskAssigner, 'taskassigner')
        const filteredTaskAssigner = taskAssigner.filter((task) => task !== "");
        // console.log(filteredTaskAssigner);

        // console.log(req.body.projectImage);
        req.body.projectImage = newPaths;
        // console.log(req.body, "body");
        const project = new Project({ ...req.body, taskAssignPerson: filteredTaskAssigner });
        // console.log(project, "project");
        const savedProject = await project.save();
        res.status(201).json(savedProject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get all projects
// exports.getAllProjects = async (req, res) => {
//     try {
//         const projects = await Project.find().populate("taskAssignPerson");
//         const updatedProjects = new Array(projects.length);
//         for (let i = 0; i < projects.length; i++) {
//             const project = projects[i];
//             const tasks = await Task.find({ projectName: project.projectName });
//             // console.log(tasks);
//             const totalTasks = tasks.length;
//             let completedTaskNum = 0;
//             for (let i = 0; i < totalTasks; i++) {
//                 if (tasks[i].isCompleted === true) {
//                     completedTaskNum++;
//                 }
//             }
//             const percent = (completedTaskNum / totalTasks * 100 || 0).toFixed(2);
//             const status = percent === "100.00" ? "Completed" : "In Progress";
//             updatedProjects[i] = {
//                 ...project._doc,
//                 progress: percent,
//                 status: status
//             }
//         }
//         res.json(updatedProjects);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };
exports.getAllProjects = async (req, res) => {
    try {
        // Fetch all projects and task assignment in a single query
        const projects = await Project.find().populate("taskAssignPerson");

        // Fetch all tasks in a single query for efficiency
        const allTasks = await Task.find();

        // Prepare the updated projects array
        const updatedProjects = projects.map(project => {
            // Filter tasks that belong to the current project
            const projectTasks = allTasks.filter(task => task.projectName === project.projectName);
            
            const totalTasks = projectTasks.length;
            const completedTaskNum = projectTasks.filter(task => task.isCompleted).length;
            
            const percent = (completedTaskNum / totalTasks * 100 || 0).toFixed(2);
            const status = percent === "100.00" ? "Completed" : "In Progress";

            return {
                ...project._doc,
                progress: percent,
                status: status
            };
        });

        // Send the updated projects as JSON response
        res.json(updatedProjects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Get a single project by projectId
exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId).populate('taskAssignPerson');
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.searchProjects = async (req, res) => {
    const queries = req.query;
    if (!queries.id) {
        return res.status(400).json({ message: "id is required to search" });
    }

    try {
        const q_regex = new RegExp(queries.id, 'i');
        // console.log(q_regex);
        const proj = await Project.find({ projectName: { $regex: q_regex } });
        return res.status(200).json(proj);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Update a project
exports.updateProject = async (req, res) => {
    try {
        // console.log(req.body);
        req.body.projectImage = req.file?.path;
        const updatedProject = await Project.findByIdAndUpdate(req.params.projectId, req.body, { new: true });

        if (!updatedProject) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(updatedProject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a project
exports.deleteProject = async (req, res) => {
    try {
        const deletedProject = await Project.findByIdAndDelete(req.params.projectId);
        if (!deletedProject) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json({ message: 'Project deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//Get project by Task Assigne Person (token)
exports.getProject = async (req, res) => {

    const auth = req.headers.authorization
    const decodedToken = jwt.decode(auth)
    try {
        const project = await Project.find({
            taskAssignPerson: {
                $in: [decodedToken]
            }
        }).populate("taskAssignPerson");
        res.json(project)
        return project;
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
}
//Get project by Task (token)
exports.getProjecttask = async (req, res) => {

    const auth = req.headers.authorization
    const decodedToken = jwt.decode(auth)
    try {
        const task = await Project.find({
            taskManager: {
                $in: [decodedToken]
            }
        }).populate("taskManager");
        res.json(task)
        return task;
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
}