const express = require('express');
const router = express.Router();
const Employee = require('../model/employeeModel');
const { uploadEmployee } = require('../utils/multerConfig');
const jwt = require('jsonwebtoken');

//Total Employee
router.get('/totalEmployees', async (req, res) => {
    try {
        const totalEmployees = await Employee.countDocuments();
        res.json({ totalEmployees });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Create a new employee
// router.post('/employees', uploadEmployee.single("employeeImage"), async (req, res) => {
//     try {
//         // Declare path as let to allow reassignment
//         let path = req.file?.location;

//         // If path is undefined or null, assign a default image
//         if (!path) {
//             path = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/employee/default.jpeg`;
//         }

//         req.body.employeeImage = path;
//         const employee = new Employee(req.body);
//         const savedEmployee = await employee.save();
//         res.status(201).json(savedEmployee);
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });
router.post('/employees', uploadEmployee.single("employeeImage"), async (req, res) => {
    try {
        console.log(req.file.path);
        const path = req.file?.path;
        // console.log(path); 
        // let newPath = path?.replace('uploads\\', "");
        let newPath = path?.replace(/uploads[\\/]/, ""); // Handles both Windows and Linux slashes
        console.log("Modified Path:", newPath);  // Debug the modified path
        if (newPath === undefined || newPath === null) {
            newPath = "default.jpeg"
        }
        // console.log(newPath);
        req.body.employeeImage = newPath;
        const employee = new Employee(req.body);
        const savedEmployee = await employee.save();
        res.status(201).json(savedEmployee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.post("/employeelogin", async (req, res) => {
    const body = req.body;
    if (!body) {
        return res.status({
            status: 400,
            message: "email, password is required."
        })
    }
    const { email, password } = body;

    if (!email || !password) {
        return res.status({
            status: 400,
            message: "email, password is required."
        })
    }

    try {
        const empDetails = await Employee.findOne({
            emailid: email,
            password: password
        }).lean()

        if (!empDetails) {
            return res.send({
                status: 400,
                message: "User not found or invalid credentials"
            })
        }

        // console.log(empDetails._id.toString())
        // const token = jwt.sign(empDetails._id.toString(), process.env.JWT_SECRET);
        const token = jwt.sign({ _id: empDetails._id }, process.env.JWT_SECRET, { expiresIn: '10d' });

        return res.status(200).send({
            status: 200,
            message: "Login success",
            user: empDetails,
            token: token
        })
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }

})

// Get all employees
router.get('/employees', async (req, res) => {
    try {
        const employees = await Employee.find()
        // console.log("testing");
        res.json(employees);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single employee
router.get('/employees/:employeeId', async (req, res) => {
    try {
        const employee = await Employee.findOne({ _id: req.params.employeeId });
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(employee);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/search", async (req, res) => {
    const queries = req.query;
    if (queries.hasOwnProperty('id') === false) {
        return res.status(200).json({ message: "id is require to search" })
    }
    const q_regex = new RegExp(queries.id, 'i');
    console.log(q_regex);
    const emps = await Employee.find({ employeeName: { $regex: q_regex } });
    // const emps = await Employee.find({ $or: [{ employeeId: { regex: q_regex } }, { employeeName: { regex: q_regex } }] })
    if (emps) {
        return res.status(200).json(emps);
    }
    console.log(queries);
    return res.sendStatus(500);
})

// Update an employee
router.put('/employees/:employeeId', uploadEmployee.single("employeeImage"), async (req, res) => {
    try {
        // Use req.file for image upload if it exists
        const updatedData = req.body;
        if (req.file) {
            updatedData.employeeImage = req.file.location; // Assuming path of the image is saved
        }

        const updatedEmployee = await Employee.findByIdAndUpdate(req.params.employeeId, updatedData, { new: true });
        if (!updatedEmployee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(updatedEmployee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Delete an employee
router.delete('/employees/:employeeId', async (req, res) => {
    try {
        const deletedEmployee = await Employee.findByIdAndDelete(req.params.employeeId)
        if (!deletedEmployee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json({ message: 'Employee deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
