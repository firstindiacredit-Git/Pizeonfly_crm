const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
    employeeName: {
        type: String,
        required: true,
    },
    employeeCompany: {
        type: String,
        // required: true
    },
    employeeImage: {
        type: String,
        // required: true
    },
    employeeId: {
        type: String,
        // required: true,
        // unique: true
    },
    joiningDate: {
        type: Date,
        // default: Date.now
    },
    username: {
        type: String,
        // required: true,
        // unique: true
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
        // required: true
    },
    department: {
        type: String,
        // required: true
    },
    designation: {
        type: String,
        // required: true
    },
    description: {
        type: String
    },
    // access:{
    //     type: Schema.Types.ObjectId,
    //     ref: 'CRMController'
    // }
});

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;