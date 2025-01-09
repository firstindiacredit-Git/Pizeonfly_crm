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

            // Get last message details
            const lastMessage = group.lastMessage || null;

            return {
                _id: group._id,
                name: group.name,
                createdAt: group.createdAt,
                totalMembers: validMembers.length,
                members: validMembers,
                lastMessage: lastMessage // Include lastMessage in response
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

        // Get sender details based on senderType
        let senderDetails;
        switch (senderType) {
            case 'AdminUser':
                senderDetails = await mongoose.model('AdminUser')
                    .findById(senderId)
                    .select('username email profileImage');
                if (senderDetails) {
                    senderDetails = {
                        name: senderDetails.username,
                        email: senderDetails.email,
                        image: senderDetails.profileImage
                    };
                }
                break;
            case 'Employee':
                senderDetails = await mongoose.model('Employee')
                    .findById(senderId)
                    .select('employeeName emailid employeeImage');
                if (senderDetails) {
                    senderDetails = {
                        name: senderDetails.employeeName,
                        email: senderDetails.emailid,
                        image: senderDetails.employeeImage
                    };
                }
                break;
            case 'Client':
                senderDetails = await mongoose.model('Client')
                    .findById(senderId)
                    .select('clientName clientEmail clientImage');
                if (senderDetails) {
                    senderDetails = {
                        name: senderDetails.clientName,
                        email: senderDetails.clientEmail,
                        image: senderDetails.clientImage
                    };
                }
                break;
        }

        // Create new chat message with sender details
        const newChat = new Chat({
            senderId,
            senderType,
            receiverId: groupId,
            receiverType: 'Group',
            message,
            senderDetails // Add sender details to the message
        });

        const savedChat = await newChat.save();

        // Update group's lastMessage
        group.lastMessage = {
            message: message,
            sender: {
                id: senderId,
                name: senderDetails.name,
                type: senderType,
                image: senderDetails.image
            },
            timestamp: new Date()
        };

        await group.save();

        // Emit message to all group members with sender details
        const io = req.app.get('io');
        group.members.forEach(member => {
            io.to(member.userId.toString()).emit('receive_group_message', {
                ...savedChat.toObject(),
                senderDetails
            });
        });

        // Also emit group update to refresh the groups list
        io.emit('group_updated', group);

        res.status(201).json({
            ...savedChat.toObject(),
            senderDetails
        });
    } catch (error) {
        console.error('Error in sendGroupMessage:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get group messages
router.get('/getGroupMessages/:groupId', async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const messages = await Chat.find({
            receiverId: groupId,
            receiverType: 'Group'
        }).sort({ createdAt: 1 });

        const processedMessages = await Promise.all(
            messages.map(async (message) => {
                let senderDetails = null;

                try {
                    if (message.senderType === 'AdminUser') {
                        const admin = await mongoose.model('AdminUser').findById(message.senderId);
                        if (admin) {
                            senderDetails = {
                                name: admin.username,
                                email: admin.email,
                                image: admin.profileImage?.replace('uploads/', ''),
                                type: 'AdminUser'
                            };
                        }
                    } 
                    else if (message.senderType === 'Employee') {
                        const employee = await mongoose.model('Employee').findById(message.senderId);
                        if (employee) {
                            senderDetails = {
                                name: employee.employeeName,
                                email: employee.emailid,
                                image: employee.employeeImage?.replace('uploads/', ''),
                                type: 'Employee'
                            };
                        }
                    } 
                    else if (message.senderType === 'Client') {
                        const client = await mongoose.model('Client').findById(message.senderId);
                        if (client) {
                            senderDetails = {
                                name: client.clientName,
                                email: client.clientEmail,
                                image: client.clientImage?.replace('uploads/', ''),
                                type: 'Client'
                            };
                        }
                    }

                    // Debug logging
                    // console.log(`Sender Type: ${message.senderType}`);
                    // console.log('Sender Details:', senderDetails);

                    return {
                        ...message.toObject(),
                        senderDetails: senderDetails
                    };

                } catch (err) {
                    console.error(`Error fetching sender details:`, err);
                    return {
                        ...message.toObject(),
                        senderDetails: null
                    };
                }
            })
        );

        res.status(200).json(processedMessages);
    } catch (error) {
        console.error('Error in getGroupMessages:', error);
        res.status(500).json({ error: error.message });
    }
});

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

        if (uniqueNewMembers.length === 0) {
            return res.status(400).json({ error: 'Selected members are already in the group' });
        }

        // Add new members with their userType
        group.members.push(...uniqueNewMembers.map(member => ({
            userId: member.userId,
            userType: member.type // Make sure to include userType
        })));

        await group.save();

        // Fetch and process complete member details
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

        // Filter out null values and prepare response
        const validMembers = membersData.filter(member => member !== null);
        const updatedGroup = {
            _id: group._id,
            name: group.name,
            createdAt: group.createdAt,
            members: validMembers
        };

        res.status(200).json(updatedGroup);
    } catch (error) {
        console.error('Error adding members:', error);
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

        // Fetch complete group details with member information
        const updatedGroup = await Group.findById(groupId);
        const processedGroup = await processGroupMembers(updatedGroup);

        res.status(200).json(processedGroup);
    } catch (error) {
        console.error('Error removing member:', error);
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

// Helper function to process group members
async function processGroupMembers(group) {
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
                        employeeImage: user.employeeImage
                    };
                }
                break;
            // ... similar cases for Client and AdminUser
        }
        return null;
    }));

    const validMembers = membersData.filter(member => member !== null);

    return {
        _id: group._id,
        name: group.name,
        createdAt: group.createdAt,
        members: validMembers
    };
}

// Add this new route after existing routes
router.post('/removeGroupMembers', async (req, res) => {
    try {
        const { groupId, memberIds } = req.body;
        const group = await Group.findById(groupId);
        
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Remove selected members
        group.members = group.members.filter(member => 
            !memberIds.includes(member.userId.toString())
        );
        
        await group.save();

        // Fetch and process complete member details
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
                // ... other cases remain the same
            }
            return null;
        }));

        const validMembers = membersData.filter(member => member !== null);
        const updatedGroup = {
            _id: group._id,
            name: group.name,
            createdAt: group.createdAt,
            members: validMembers
        };

        res.status(200).json(updatedGroup);
    } catch (error) {
        console.error('Error removing members:', error);
        res.status(500).json({ error: error.message });
    }
});



module.exports = router;

