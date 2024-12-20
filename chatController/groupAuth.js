const express = require('express');
const router = express.Router();
const Group = require('../chatModel/groupModel');
const { Chat } = require('../chatModel/chatModel');
const mongoose = require('mongoose');

// Create group
router.post('/createGroup', async (req, res) => {
    try {
        const { name, members } = req.body;
        
        // console.log('Received request data:', { name, members });

        // Validate members data
        if (!Array.isArray(members) || members.length === 0) {
            return res.status(400).json({ error: 'Members array is required and cannot be empty' });
        }

        // First fetch all members' data
        const membersData = await Promise.all(members.map(async (member) => {
            let user;
            switch (member.userType) {
                case 'Employee':
                    user = await mongoose.model('Employee').findById(member.userId)
                        .select('employeeName emailid phone department designation joiningDate employeeId employeeImage');
                    if (user) {
                        return {
                            userId: user._id,
                            userType: member.userType,
                            name: user.employeeName,
                            email: user.emailid,
                            phone: user.phone,
                            department: user.department,
                            designation: user.designation,
                            joinDate: user.joiningDate,
                            employeeId: user.employeeId,
                            employeeImage: user.employeeImage
                        };
                    }
                    break;

                case 'Client':
                    user = await mongoose.model('Client').findById(member.userId)
                        .select('clientName businessName clientEmail clientPhone clientImage');
                    if (user) {
                        return {
                            userId: user._id,
                            userType: member.userType,
                            name: user.clientName,
                            businessName: user.businessName,
                            email: user.clientEmail,
                            phone: user.clientPhone,
                            image: user.clientImage
                        };
                    }
                    break;

                case 'AdminUser':
                    user = await mongoose.model('AdminUser').findById(member.userId)
                        .select('username email profileImage');
                    if (user) {
                        return {
                            userId: user._id,
                            userType: member.userType,
                            name: user.username,
                            email: user.email,
                            profileImage: user.profileImage
                        };
                    }
                    break;
            }
            return null;
        }));

        // Filter out any null values
        const validMembers = membersData.filter(member => member !== null);

        if (validMembers.length === 0) {
            return res.status(404).json({ error: 'No valid members found' });
        }

        // Create group with original member format
        const newGroup = new Group({
            name,
            members: members
        });
        
        const savedGroup = await newGroup.save();

        const response = {
            groupName: savedGroup.name,
            groupId: savedGroup._id,
            createdAt: savedGroup.createdAt,
            totalMembers: validMembers.length,
            members: validMembers
        };

        // console.log('Final Response:', response);
        res.status(201).json(response);

    } catch (error) {
        console.error('Group creation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all groups
router.get('/groups', async (req, res) => {
    try {
        const groups = await Group.find();
        
        // Process each group to get member details
        const processedGroups = await Promise.all(groups.map(async (group) => {
            const membersData = await Promise.all(group.members.map(async (member) => {
                let user;
                switch (member.userType) {
                    case 'Employee':
                        user = await mongoose.model('Employee').findById(member.userId)
                            .select('employeeName emailid phone department designation joiningDate employeeId employeeImage');
                        if (user) {
                            return {
                                userId: user._id,
                                userType: member.userType,
                                name: user.employeeName,
                                email: user.emailid,
                                phone: user.phone,
                                department: user.department,
                                designation: user.designation,
                                joinDate: user.joiningDate,
                                employeeId: user.employeeId,
                                employeeImage: user.employeeImage
                            };
                        }
                        break;

                    case 'Client':
                        user = await mongoose.model('Client').findById(member.userId)
                            .select('clientName businessName clientEmail clientPhone clientImage');
                        if (user) {
                            return {
                                userId: user._id,
                                userType: member.userType,
                                name: user.clientName,
                                businessName: user.businessName,
                                email: user.clientEmail,
                                phone: user.clientPhone,
                                image: user.clientImage
                            };
                        }
                        break;

                    case 'AdminUser':
                        user = await mongoose.model('AdminUser').findById(member.userId)
                            .select('username email profileImage');
                        if (user) {
                            return {
                                userId: user._id,
                                userType: member.userType,
                                name: user.username,
                                email: user.email,
                                profileImage: user.profileImage
                            };
                        }
                        break;
                }
                return null;
            }));

            // Filter out null values
            const validMembers = membersData.filter(member => member !== null);

            return {
                _id: group._id,
                name: group.name,
                createdAt: group.createdAt,
                totalMembers: validMembers.length,
                members: validMembers
            };
        }));

        res.status(200).json(processedGroups);
    } catch (error) {
        console.error('Get groups error:', error);
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
            .populate({
                path: 'members.userId',
                select: 'username employeeName clientName profileImage employeeImage clientImage businessName emailid clientEmail phoneNumber role status'
            });
        
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

