const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminDashSchema = new Schema({
    email: {
        type: String,// take from local storage(user)
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
    },
    todoColor: {
        type: String,
    },
    excelSheetColor: {
        type: String,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AdminDash', adminDashSchema);