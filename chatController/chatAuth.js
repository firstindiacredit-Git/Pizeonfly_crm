const express = require('express');
const router = express.Router();
const Chat = require('../chatModel/chatModel');
const { uploadChat } = require('../utils/multerConfig');

// Create new chat message
router.post('/createChat', uploadChat, async (req, res) => {
    try {
        const { senderId, senderType, receiverId, receiverType, message } = req.body;

        // Initialize file URLs
        let imageUrls = [];
        let videoUrl = '';
        let audioUrl = '';
        let recordingUrl = '';

        // Handle uploaded files
        if (req.files) {
            // Handle images
            if (req.files.images) {
                imageUrls = req.files.images.map(file => `uploads/chat/images/${file.filename}`);
            }
            
            // Handle video
            if (req.files.video && req.files.video[0]) {
                videoUrl = `uploads/chat/videos/${req.files.video[0].filename}`;
            }
            
            // Handle audio
            if (req.files.audio && req.files.audio[0]) {
                audioUrl = `uploads/chat/audio/${req.files.audio[0].filename}`;
            }
            
            // Handle recording
            if (req.files.recording && req.files.recording[0]) {
                recordingUrl = `uploads/chat/audio/${req.files.recording[0].filename}`;
            }
        }

        const newChat = new Chat({
            senderId,
            senderType,
            receiverId,
            receiverType,
            message: message || '',
            imageUrls,
            videoUrl,
            audioUrl,
            recordingUrl
        });

        const savedChat = await newChat.save();

        // Emit socket event for real-time notification
        const io = req.app.get('io');
        io.to(receiverId).emit('new_chat_message', savedChat);

        res.status(201).json(savedChat);
    } catch (error) {
        console.error('Chat creation error:', error);
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