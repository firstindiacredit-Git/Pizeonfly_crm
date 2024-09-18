const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskMessageSchema = new Schema({
    currentMessage: {
        type: String,
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Employee"
    },
    task_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task"
    },
}, { timestamps: true });

const TaskMessage = mongoose.model('TaskMessage', taskMessageSchema);

module.exports = TaskMessage;
