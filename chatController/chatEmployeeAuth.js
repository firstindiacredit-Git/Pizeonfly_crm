const express = require('express');
const router = express.Router();
const { EmployeeChat, EmployeeChatSettings, EmployeeStatus } = require('../chatModel/chatEmployeeModel');
const Employee = require('../model/employeeModel');
const { uploadEmployeeChat } = require('../utils/multerConfig');

// Debug endpoint to check all employees
router.get('/debug/allEmployees', async (req, res) => {
    try {
        const allEmployees = await Employee.find({}).select('employeeName employeeImage emailid department designation disabled _id');
        console.log('All employees in database:', allEmployees.length);
        console.log('Employee details:', allEmployees.map(emp => ({
            id: emp._id,
            name: emp.employeeName,
            disabled: emp.disabled
        })));
        
        res.status(200).json({
            total: allEmployees.length,
            employees: allEmployees
        });
    } catch (error) {
        console.error('Debug employees error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all employees except the current user
router.get('/getEmployees/:currentUserId', async (req, res) => {
    try {
        console.log('Fetching employees for user:', req.params.currentUserId);
        
        // First, let's check total employees in database
        const totalEmployees = await Employee.countDocuments();
        console.log('Total employees in database:', totalEmployees);
        
        // Get all employees except current user (without disabled filter first)
        const allEmployees = await Employee.find({ 
            _id: { $ne: req.params.currentUserId }
        }).select('employeeName employeeImage emailid department designation disabled');
        
        console.log('Employees found (excluding current user):', allEmployees.length);
        
        // Filter out disabled employees
        const activeEmployees = allEmployees.filter(emp => emp.disabled !== true);
        console.log('Active employees (not disabled):', activeEmployees.length);
        
        // Log disabled employees for debugging
        const disabledEmployees = allEmployees.filter(emp => emp.disabled === true);
        console.log('Disabled employees:', disabledEmployees.length);
        if (disabledEmployees.length > 0) {
            console.log('Disabled employee names:', disabledEmployees.map(emp => emp.employeeName));
        }
        
        res.status(200).json(activeEmployees);
    } catch (error) {
        console.error('Get employees error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create new employee chat message
router.post('/createChat', uploadEmployeeChat, async (req, res) => {
    try {
        const { senderId, receiverId, message } = req.body;

        // Initialize file URLs
        let imageUrls = [];
        let videoUrl = '';
        let audioUrl = '';
        let recordingUrl = '';

        // Handle uploaded files
        if (req.files) {
            // Handle images
            if (req.files.images) {
                imageUrls = req.files.images.map(file => `uploads/employee-chat/images/${file.filename}`);
            }

            // Handle video
            if (req.files.video && req.files.video[0]) {
                videoUrl = `uploads/employee-chat/videos/${req.files.video[0].filename}`;
            }

            // Handle audio
            if (req.files.audio && req.files.audio[0]) {
                audioUrl = `uploads/employee-chat/audio/${req.files.audio[0].filename}`;
            }

            // Handle recording
            if (req.files.recording && req.files.recording[0]) {
                recordingUrl = `uploads/employee-chat/audio/${req.files.recording[0].filename}`;
            }
        }

        // Validate that either message or files are present
        const hasMessage = message && message.trim().length > 0;
        const hasFiles = imageUrls.length > 0 || videoUrl || audioUrl || recordingUrl;
        
        console.log('Chat creation - hasMessage:', hasMessage, 'hasFiles:', hasFiles);
        console.log('Files received:', { imageUrls, videoUrl, audioUrl, recordingUrl });
        
        if (!hasMessage && !hasFiles) {
            return res.status(400).json({ error: 'Either message or files must be provided' });
        }

        const newChat = new EmployeeChat({
            senderId,
            receiverId,
            message: message || '',
            imageUrls,
            videoUrl,
            audioUrl,
            recordingUrl
        });

        const savedChat = await newChat.save();

        // Populate sender and receiver details
        await savedChat.populate([
            { path: 'senderId', select: 'employeeName employeeImage' },
            { path: 'receiverId', select: 'employeeName employeeImage' }
        ]);

        // Emit to both sender and receiver
        const io = req.app.get('io');
        console.log('Emitting message to rooms:', `employee_${receiverId}`, `employee_${senderId}`);
        io.to(`employee_${receiverId}`).emit('receive_employee_message', savedChat);
        io.to(`employee_${senderId}`).emit('employee_message_sent', savedChat);

        res.status(201).json(savedChat);
    } catch (error) {
        console.error('Employee chat creation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all chats for an employee
router.get('/getChats/:employeeId', async (req, res) => {
    try {
        const chats = await EmployeeChat.find({
            $or: [
                { senderId: req.params.employeeId },
                { receiverId: req.params.employeeId }
            ]
        })
        .populate('senderId', 'employeeName employeeImage')
        .populate('receiverId', 'employeeName employeeImage')
        .sort({ createdAt: -1 });
        
        res.status(200).json(chats);
    } catch (error) {
        console.error('Get employee chats error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get chat between two employees
router.get('/getChats/:senderId/:receiverId', async (req, res) => {
    try {
        const chats = await EmployeeChat.find({
            $or: [
                { senderId: req.params.senderId, receiverId: req.params.receiverId },
                { senderId: req.params.receiverId, receiverId: req.params.senderId }
            ]
        })
        .populate('senderId', 'employeeName employeeImage')
        .populate('receiverId', 'employeeName employeeImage')
        .sort({ createdAt: 1 });

        // Filter out messages that were cleared by this user
        const filteredChats = chats.filter(chat => {
            const clearRecord = chat.clearedBy.find(
                clear => clear.userId.toString() === req.params.senderId
            );
            if (!clearRecord) return true;
            return chat.createdAt > clearRecord.clearedAt;
        });

        // Mark messages as read for the current user (receiver)
        await EmployeeChat.updateMany(
            {
                senderId: req.params.receiverId,
                receiverId: req.params.senderId,
                isRead: false
            },
            {
                isRead: true,
                readAt: new Date()
            }
        );

        res.status(200).json(filteredChats);
    } catch (error) {
        console.error('Get employee chat between users error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update employee chat message
router.put('/updateChat/:chatId', async (req, res) => {
    try {
        const { message } = req.body;
        const chatId = req.params.chatId;

        const updatedChat = await EmployeeChat.findByIdAndUpdate(
            chatId,
            {
                message,
                updatedAt: Date.now(),
                isEdited: true
            },
            { new: true }
        ).populate('senderId', 'employeeName employeeImage')
         .populate('receiverId', 'employeeName employeeImage');

        if (!updatedChat) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Emit socket event for real-time update to both sender and receiver
        const io = req.app.get('io');
        io.to(`employee_${updatedChat.senderId._id}`).emit('employee_message_updated', updatedChat);
        io.to(`employee_${updatedChat.receiverId._id}`).emit('employee_message_updated', updatedChat);

        res.status(200).json(updatedChat);
    } catch (error) {
        console.error('Update employee chat error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete employee chat message
router.delete('/deleteChat/:chatId', async (req, res) => {
    try {
        const chatId = req.params.chatId;
        const chat = await EmployeeChat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Instead of deleting, mark as deleted and clear the message
        const updatedChat = await EmployeeChat.findByIdAndUpdate(
            chatId,
            {
                isDeleted: true,
                message: '',
                imageUrls: [],
                videoUrl: '',
                audioUrl: '',
                recordingUrl: ''
            },
            { new: true }
        ).populate('senderId', 'employeeName employeeImage')
         .populate('receiverId', 'employeeName employeeImage');

        // Emit socket event for real-time deletion to both sender and receiver
        const io = req.app.get('io');
        io.to(`employee_${chat.senderId}`).emit('employee_message_deleted', updatedChat);
        io.to(`employee_${chat.receiverId}`).emit('employee_message_deleted', updatedChat);

        res.status(200).json(updatedChat);
    } catch (error) {
        console.error('Delete employee chat error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Clear employee chat
router.post('/clearChat', async (req, res) => {
    try {
        const { userId, otherUserId } = req.body;

        // Find all chats between these employees
        const chats = await EmployeeChat.find({
            $or: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId }
            ]
        });

        // Update all chats to mark them as cleared for this user
        await Promise.all(chats.map(chat => {
            // Remove any existing clear record for this user
            chat.clearedBy = chat.clearedBy.filter(clear => 
                clear.userId.toString() !== userId.toString()
            );
            
            // Add new clear record
            chat.clearedBy.push({
                userId,
                clearedAt: new Date()
            });
            
            return chat.save();
        }));

        res.status(200).json({ message: 'Chat cleared successfully' });
    } catch (error) {
        console.error('Clear employee chat error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get employee status
router.get('/getEmployeeStatus/:employeeId', async (req, res) => {
    try {
        const status = await EmployeeStatus.findOne({ userId: req.params.employeeId });
        res.status(200).json(status || { isOnline: false });
    } catch (error) {
        console.error('Get employee status error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all online employees
router.get('/getOnlineEmployees/:currentUserId', async (req, res) => {
    try {
        const onlineEmployees = await EmployeeStatus.find({ 
            userId: { $ne: req.params.currentUserId },
            isOnline: true 
        }).populate('userId', 'employeeName employeeImage emailid department designation');
        
        res.status(200).json(onlineEmployees);
    } catch (error) {
        console.error('Get online employees error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get unread message count between two employees
router.get('/getUnreadCount/:currentUserId/:otherUserId', async (req, res) => {
    try {
        const { currentUserId, otherUserId } = req.params;
        
        // Count only unread messages where the other user is sender and current user is receiver
        const unreadCount = await EmployeeChat.countDocuments({
            senderId: otherUserId,
            receiverId: currentUserId,
            isRead: false
        });
        
        res.status(200).json({ count: unreadCount });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
