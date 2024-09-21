const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
    employeeName: {
        type: String,
        required: true,
    },
    employeeCompany: {
        type: String,
    },
    employeeImage: {
        type: String,
    },
    employeeId: {
        type: String,
    },
    joiningDate: {
        type: Date,
    },
    username: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    emailid: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
    },
    department: {
        type: String,
    },
    designation: {
        type: String,
    },
    description: {
        type: String
    },
});

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;