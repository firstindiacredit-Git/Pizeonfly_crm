const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const projectSchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: true
    },
    projectDate: {
        type: Date,
        default: Date.now
    },
    projectCategory: {
        type: String,
        required: true
    },
    projectImage: [{
        type: String
    }],
    projectStartDate: {
        type: Date,
        required: true
    },
    projectEndDate: {
        type: Date
    },
    taskAssignPerson: [{
        type: Schema.Types.ObjectId,
        ref: 'Employee'
    }],
    description: {
        type: String
    },
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
