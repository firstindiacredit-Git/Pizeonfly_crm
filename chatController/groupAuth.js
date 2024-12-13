const express = require('express');
const router = express.Router();
const Group = require('../chatModel/groupModel');
const { Chat } = require('../chatModel/chatModel');

// Create group
router.post('/createGroup', async (req, res) => {
    try {
        const { name, members } = req.body;
        const newGroup = new Group({
            name,
            members
        });
        const savedGroup = await newGroup.save();
        
        // Populate member details after saving
        const populatedGroup = await Group.findById(savedGroup._id)
            .populate('members.userId', 'username employeeName clientName profileImage employeeImage clientImage businessName emailid clientEmail');

        res.status(201).json(populatedGroup);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all groups
router.get('/groups', async (req, res) => {
    try {
        const groups = await Group.find()
            .populate('members.userId', 'username employeeName clientName profileImage employeeImage clientImage businessName emailid clientEmail');
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send message to group
router.post('/sendGroupMessage', async (req, res) => {
    try {
        const { groupId, senderId, senderType, message } = req.body;
        const group = await Group.findById(groupId);
        
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const newChat = new Chat({
            senderId,
            senderType,
            receiverId: groupId,
            receiverType: 'Group',
            message
        });

        const savedChat = await newChat.save();

        // Emit message to all group members
        const io = req.app.get('io');
        group.members.forEach(member => {
            io.to(member.userId.toString()).emit('receive_group_message', savedChat);
        });

        res.status(201).json(savedChat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get group messages
router.get('/getGroupMessages/:groupId', async (req, res) => {
    try {
        const messages = await Chat.find({
            receiverId: req.params.groupId,
            receiverType: 'Group'
        }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new endpoints for group management

// Add members to group
router.post('/addGroupMembers', async (req, res) => {
    try {
        const { groupId, newMembers } = req.body;
        const group = await Group.findById(groupId);
        
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Filter out members that are already in the group
        const uniqueNewMembers = newMembers.filter(newMember => 
            !group.members.some(existingMember => 
                existingMember.userId.toString() === newMember.userId
            )
        );

        group.members.push(...uniqueNewMembers);
        await group.save();

        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove member from group
router.post('/removeGroupMember', async (req, res) => {
    try {
        const { groupId, memberId } = req.body;
        const group = await Group.findById(groupId);
        
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        group.members = group.members.filter(member => 
            member.userId.toString() !== memberId
        );
        await group.save();

        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get group details
router.get('/groupDetails/:groupId', async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId)
            .populate('members.userId', 'username employeeName clientName profileImage employeeImage clientImage');
        
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
