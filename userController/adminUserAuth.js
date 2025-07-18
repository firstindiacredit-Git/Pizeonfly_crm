const User = require('../userModel/adminUserModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const sendEmail = require('../utils/emailService');

dotenv.config();

exports.signupUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    if (!username || !email || !password || !role) {
      throw new Error('Missing required fields');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, role, password: hashedPassword });
    await newUser.save();
    res.json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { role, email, password } = req.body;
  const userIp = req.userIp;

  try {
    const user = await User.findOne({ email });

    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match && user.role.toString() === role) {
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET);
        res.json({ token, user, userIp });
      } else {
        res.status(401).json('Incorrect email, password, or role');
      }
    } else {
      res.status(401).json('User not found');
    }
  } catch (error) {
    res.status(400).json('Error: ' + error.message);
  }
};

exports.changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    if (!email || !oldPassword || !newPassword) {
      throw new Error('Missing required fields');
    }

    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }

    const user = await User.findOne({ email });

    if (user) {
      const match = await bcrypt.compare(oldPassword, user.password);

      if (match) {
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
      } else {
        res.status(401).json('Incorrect old password');
      }
    } else {
      res.status(401).json('User not found');
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.find();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user.userId; // From JWT token

    const updateData = { username };
    if (req.file) {
      updateData.profileImage = req.file.path;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.verifySecurityPin = async (req, res) => {
  const { pin } = req.body;
  
  try {
    // Replace this with your actual security PIN
    const SECURITY_PIN = process.env.SECURITY_PIN || "123456";
    
    if (pin === SECURITY_PIN) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: "Invalid security PIN" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) throw new Error('Email is required');
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Generate reset token (JWT, expires in 1 hour)
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    // Reset link (frontend route)
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/reset-password/${resetToken}`;
    // Email content
    const subject = 'Password Reset Request';
    const message = `Hello ${user.username},\n\nPlease click the following link to reset your password:\n${resetLink}\n\nIf you did not request this, please ignore this email.`;
    await sendEmail(subject, message, user.email);
    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    if (!token || !newPassword) throw new Error('Token and new password are required');
    if (newPassword.length < 8) throw new Error('Password must be at least 8 characters');
    // Verify token
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    // console.log("Payload:", payload);
    // console.log("UserId for update:", payload.userId);
    const userBefore = await User.findById(payload.userId);
    // console.log("User before update:", userBefore);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.findByIdAndUpdate(
      payload.userId,
      { password: hashedPassword },
      { new: true }
    );
    // console.log("User after update:", updatedUser);
    // Send confirmation email
    const subject = 'Password Updated Successfully';
    const message = `Hello ${userBefore.username},\n\nYour password has been updated successfully. If you did not perform this action, please contact support immediately.`;
    await sendEmail(subject, message, userBefore.email);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({ error: error.message });
  }
};
