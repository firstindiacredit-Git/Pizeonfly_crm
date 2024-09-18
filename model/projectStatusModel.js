const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectStatusSchema = new Schema({
    currentStatus: {
        type: String,
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Employee"
    },
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    },

}, { timestamps: true });

const ProjectStatus = mongoose.model('ProjectStatus', projectStatusSchema);

module.exports = ProjectStatus;
