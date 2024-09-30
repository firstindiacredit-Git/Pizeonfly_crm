const express = require('express');
const router = express.Router();
const { upload } = require('../utils/multerConfig')
const employeeController = require('../controller/employeeAuth');

console.log(upload);
// Define routes for employee-related operations
router.post('/employees', uploadEmployee.single("employeeImage"), employeeController.createEmployee);



router.get('/employees', employeeController.getAllEmployees);
router.get('/employees/:employeeId', employeeController.getEmployeeById);
router.put('/employees/:employeeId', employeeController.updateEmployee);
router.delete('/employees/:employeeId', employeeController.deleteEmployee);
router.get('/totalEmployees', employeeController.getTotalEmployees);

module.exports = router;
