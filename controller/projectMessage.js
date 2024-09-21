const express = require('express');
const Message = require('../model/projectMessageModel');
const router = express.Router();

// Create a message
router.post('/projectMessage', async (req, res) => {
  const { content, senderId, projectId } = req.body;

  try {
    const message = new Message({ content, senderId, projectId });
    await message.save();
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
