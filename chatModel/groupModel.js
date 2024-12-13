const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    members: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        userType: {
            type: String,
            required: true,
            enum: ['AdminUser', 'Employee', 'Client']
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Group', groupSchema);
