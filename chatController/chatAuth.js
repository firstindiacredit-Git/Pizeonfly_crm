const express = require('express');
const router = express.Router();
const Chat = require('../chatModel/chatModel');

// Create new chat message
router.post('/createChat', async (req, res) => {
    try {
        const { 
            senderId, 
            senderType,
            receiverId, 
            receiverType,
            message, 
            imageUrls, 
            audioUrl, 
            videoUrl, 
            recordingUrl, 
            emoji 
        } = req.body;
        
        const newChat = new Chat({
            senderId,
            senderType,
            receiverId,
            receiverType,
            message,
            imageUrls,
            audioUrl,
            videoUrl,
            recordingUrl,
            emoji
        });
        
        const savedChat = await newChat.save();
        
        // Emit socket event for real-time notification
        const io = req.app.get('io');
        io.to(receiverId).emit('new_chat_message', savedChat);
        
        res.status(201).json(savedChat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all chats for a user
router.get('/getChats/:senderId', async (req, res) => {
    try {
        const chats = await Chat.find({ 
            $or: [
                { senderId: req.params.senderId },
                { receiverId: req.params.senderId }
            ]
        }).sort({ createdAt: -1 });
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get chat between two users
router.get('/getChats/:senderId/:receiverId', async (req, res) => {
    try {
        const chats = await Chat.find({
            $or: [
                { senderId: req.params.senderId, receiverId: req.params.receiverId },
                { senderId: req.params.receiverId, receiverId: req.params.senderId }
            ]
        }).sort({ createdAt: 1 });
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/updateChat/:chatId', async (req, res) => {
   
});

router.delete('/deleteChat/:chatId', async (req, res) => {
   
});






module.exports = router;