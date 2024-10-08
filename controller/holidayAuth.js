const express = require("express");
const holiday = require("../jsonfile/2024holiday.json");
const sendEmail = require("../utils/emailService");
const Employee = require("../model/employeeModel");
const Holiday = require("../model/holiday");


const router = express.Router();

// Route to get holidays
router.get("/holidays", (req, res) => {
    res.json(holiday); // Return all holiday data
});

// Route to notify employees about the holiday
router.post("/notify-holiday", async (req, res) => {
    const { holidayName, holidayDate, isConfirmed } = req.body;

    try {
        // Update holiday confirmation status in the database
        const holiday = await Holiday.findOne({ name: holidayName, date: holidayDate });
        if (holiday) {
            holiday.isConfirmed = isConfirmed;
            await holiday.save();
        }

        // If not confirmed, respond with no holiday message
        if (!isConfirmed) {
            return res.status(200).json({ message: "There is no holiday tomorrow. Please come on time, all employees." });
        }

        // Fetch all employees' emails
        const employees = await Employee.find();
        const emailList = employees.map(emp => emp.emailid).join(", ");

        const subject = `Tomorrow is a holiday: ${holidayName}`;
        const message = `Tomorrow is a holiday of ${holidayName} on ${holidayDate}. Enjoy your day off!`;

        await sendEmail(subject, message, emailList);

        res.status(200).json({ message: "Holiday notification sent successfully!" });
    } catch (error) {
        console.error("Error notifying employees:", error);
        res.status(500).json({ message: "Error sending holiday notification." });
    }
});



module.exports = router;
