const express = require('express');
const router = express.Router();
const Employee = require('../model/employeeModel');
const { uploadEmployee } = require('../utils/multerConfig');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const dotenv = require("dotenv");

dotenv.config();

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
const upload = uploadEmployee.fields([
  { name: 'employeeImage', maxCount: 1 },
  { name: 'resume', maxCount: 2  },
  { name: 'aadhaarCard', maxCount: 2 },
  { name: 'panCard', maxCount: 2 }
]);

router.post('/employees', upload, async (req, res) => {
    try {
        const files = req.files;
        const employeeData = req.body;

        if (files.employeeImage) {
            let newPath = files.employeeImage[0].path.replace('uploads\\', "");
            employeeData.employeeImage = newPath;
        } else {
            employeeData.employeeImage = "default.jpeg";
        }

        if (files.resume) {
            employeeData.resume = files.resume[0].path.replace('uploads\\', "");
        }
        if (files.aadhaarCard) {
            employeeData.aadhaarCard = files.aadhaarCard[0].path.replace('uploads\\', "");
        }
        if (files.panCard) {
            employeeData.panCard = files.panCard[0].path.replace('uploads\\', "");
        }

        employeeData.socialLinks = {
            linkedin: employeeData.linkedin || '',
            instagram: employeeData.instagram || '',
            youtube: employeeData.youtube || '',
            facebook: employeeData.facebook || '',
            github: employeeData.github || '',
            website: employeeData.website || '',
            other: employeeData.other || ''
        };

        delete employeeData.linkedin;
        delete employeeData.instagram;
        delete employeeData.youtube;
        delete employeeData.facebook;
        delete employeeData.github;
        delete employeeData.website;
        delete employeeData.other;

        const employee = new Employee(employeeData);
        const savedEmployee = await employee.save();
        sendEmail(savedEmployee);
        res.status(201).json(savedEmployee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Email sending function
async function sendEmail(employee) {
    // Configure Nodemailer with your email service (for example, Gmail)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.USER_PASSWORD
        },
    });

    const mailOptions = {
        from: process.env.USER_EMAIL,
        to: employee.emailid, // Send email to the employee's email address
        subject: 'PIZEONFLY - Your Account Details',
        html: `
            <h1>Hello ${employee.employeeName},</h1>
            <p>You have been added as an Employee at PIZEONFLY. Here are your details:</p>
            <ul>
                <li><strong>Email:</strong> ${employee.emailid}</li>
                <li><strong>Password:</strong> ${employee.password}</li>
            </ul>
            <p><a href="https://crm.pizeonfly.com/#/employeesignin">Click here to login</a></p>
            <p>If you have any queries, please contact MD-Afzal at 9015662728</p>
            <p>Thank you for choosing our service!</p>
        `,
    };
    // Send the email
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${employee.emailid}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}


//employee login
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
        const token = jwt.sign({ _id: empDetails._id }, process.env.JWT_SECRET);

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
router.put('/employees/:employeeId', upload, async (req, res) => {
    try {
        // First get the existing employee
        const existingEmployee = await Employee.findById(req.params.employeeId);
        if (!existingEmployee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const files = req.files;
        const updatedData = req.body;

        // Handle file uploads if they exist
        if (files) {
            if (files.employeeImage) {
                updatedData.employeeImage = files.employeeImage[0].path.replace('uploads\\', "");
            }
            if (files.resume) {
                updatedData.resume = files.resume[0].path.replace('uploads\\', "");
            }
            if (files.aadhaarCard) {
                updatedData.aadhaarCard = files.aadhaarCard[0].path.replace('uploads\\', "");
            }
            if (files.panCard) {
                updatedData.panCard = files.panCard[0].path.replace('uploads\\', "");
            }
        }

        // Handle social links - ensure single values and merge with existing links
        const socialLinks = {
            linkedin: Array.isArray(updatedData.linkedin) ? updatedData.linkedin[0] : (updatedData.linkedin || existingEmployee.socialLinks?.linkedin || ''),
            instagram: Array.isArray(updatedData.instagram) ? updatedData.instagram[0] : (updatedData.instagram || existingEmployee.socialLinks?.instagram || ''),
            youtube: Array.isArray(updatedData.youtube) ? updatedData.youtube[0] : (updatedData.youtube || existingEmployee.socialLinks?.youtube || ''),
            facebook: Array.isArray(updatedData.facebook) ? updatedData.facebook[0] : (updatedData.facebook || existingEmployee.socialLinks?.facebook || ''),
            github: Array.isArray(updatedData.github) ? updatedData.github[0] : (updatedData.github || existingEmployee.socialLinks?.github || ''),
            website: Array.isArray(updatedData.website) ? updatedData.website[0] : (updatedData.website || existingEmployee.socialLinks?.website || ''),
            other: Array.isArray(updatedData.other) ? updatedData.other[0] : (updatedData.other || existingEmployee.socialLinks?.other || '')
        };

        // Remove individual social link fields
        delete updatedData.linkedin;
        delete updatedData.instagram;
        delete updatedData.youtube;
        delete updatedData.facebook;
        delete updatedData.github;
        delete updatedData.website;
        delete updatedData.other;

        // Add the social links object to the update data
        updatedData.socialLinks = socialLinks;

        // Update the employee with the new data
        const updatedEmployee = await Employee.findByIdAndUpdate(
            req.params.employeeId,
            { $set: updatedData },
            { new: true }
        );

        res.json(updatedEmployee);
    } catch (err) {
        console.error('Update error:', err);
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
