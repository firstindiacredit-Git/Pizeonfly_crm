const express = require('express');
const router = express.Router();
const chatController = require('../controller/chatAuth');

router.post('/chats', chatController.createTaskChat); // done

// router.get('/chats', chatController.getTaskChat);

router.get('/chats/:taskId', chatController.getTaskChat);

module.exports = router;

