const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminDashSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    excelSheet: {
        type: String,
    },
    notePad: {
        type: String,
    },
    todoList: {
        type: String,
    },
    notepadColor: {
        type: String,
        // default: '#fff3cd'
    },
    todoColor: {
        type: String,
        // default: '#cfe2ff'
    },
    excelSheetColor: {
        type: String,
        // default: '#d4edda'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AdminDash', adminDashSchema);
