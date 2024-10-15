// routes/messageRoutes.js
const express = require('express');
const Message = require('../model/projectMessageModel');
const { uploadMessage } = require('../utils/multerConfig');
const router = express.Router();

// Create a message
router.post('/projectMessage', uploadMessage.array('files', 5), async (req, res) => { // Limit to 5 files
  const { content, senderId, projectId } = req.body;
  const fileUrls = req.files ? req.files.map(file => file.location) : []; // Get URLs of uploaded files

  try {
    const message = new Message({ content, senderId, projectId, fileUrls });
    await message.save();
    
    // Emit socket event for new message
    req.app.get('io').to(projectId).emit('new message', message);
    
    // Emit socket event for new notification
    req.app.get('io').to(projectId).emit('new notification', {
      projectId,
      message: `New message from ${senderId} in project ${projectId}`
    });
    
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error creating message', error });
  }
});

// Get messages for a project
router.get('/messages/:projectId', async (req, res) => {
  try {
    const messages = await Message.find({ projectId: req.params.projectId });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error });
  }
});

module.exports = router;
