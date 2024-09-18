const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const taskSchema = new Schema({

    assignedBy: {
        type: String,
        required: true
    },
    projectName: {
        type: String,
        required: true
    },
    taskDate: {
        type: Date,
        default: Date.now
    },
    // taskCategory: {
    //     type: String,
    //     // required: true
    // },
    taskImages: [{
        type: String,
        // required: true
    }],
    // taskStartDate: {
    //     type: Date,
    //     // required: true
    // },
    taskEndDate: {
        type: Date,
        // required: true
    },
    taskAssignPerson: {
        type: Schema.Types.ObjectId,
        ref: 'Employee'
    },
    taskPriority: {
        type: String,
        // required: true
    },
    isCompleted: {
        type: Boolean,
        default: false,
        required: true
    },
    taskStatus: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Complete'],
        default: 'Not Started'
    },
    description: {
        type: String,
    },
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
