const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const employeeDashSchema = new Schema({
    excelSheet: {
        type: String,
    },
    notePad: {
        type: String,
    },
    todoList: {
        type: String,
    },
});

module.exports = mongoose.model('EmployeeDash', employeeDashSchema);
