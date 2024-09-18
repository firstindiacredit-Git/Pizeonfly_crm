const express = require('express');
const router = express.Router();
const userController = require('../userController/adminUserAuth');

router.post('/signup', userController.signupUser);
router.post('/login', userController.loginUser);
router.get('/adminuser', userController.getUserProfile);
router.post('/change-password', userController.changePassword);

module.exports = router;