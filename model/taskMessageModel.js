const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    content: { type: String, required: true },
    senderId: { type: String, required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TaskMessage', messageSchema);