const express = require('express');
const router = express.Router();
const Meeting = require('../model/meetingModel');
const nodemailer = require('nodemailer');
const dotenv = require("dotenv");
const twilio = require('twilio');

dotenv.config();

// Add after dotenv.config()
if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
  console.error('Missing required Twilio configuration');
}

// Add Twilio client initialization after dotenv.config()
const twilioClient = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Create a meeting
router.post('/create-meeting', async (req, res) => {
  try {
    const {
      title, description, date, startTime, duration,
      guestName, guestEmail, guestPhone, additionalGuests,
      currentRevenue, revenueGoal, businessStruggle,
      confirmAttendance, agreedToTerms, organizer
    } = req.body;
    
    if (!agreedToTerms) {
      return res.status(400).json({ 
        success: false, 
        error: "You must agree to the terms and conditions" 
      });
    }

    const meeting = new Meeting({
      title,
      description,
      date,
      startTime,
      duration,
      guestName,
      guestEmail,
      guestPhone,
      additionalGuests,
      currentRevenue,
      revenueGoal,
      businessStruggle,
      confirmAttendance,
      agreedToTerms,
      organizer
    });

    await meeting.save();
    
    // Send all notifications in parallel
    await Promise.all([
      sendMeetingConfirmation(meeting),
      sendMeetingSMS(meeting),
      sendWhatsAppMessage(meeting)
    ]);
    
    res.status(201).json({ success: true, meeting });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Email sending function for meeting confirmation
async function sendMeetingConfirmation(meeting) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASSWORD
    },
  });

  // Format date and time for email
  const meetingDate = new Date(meeting.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: meeting.guestEmail,
    subject: `Meeting Confirmation: ${meeting.title}`,
    html: `
      <h1>Meeting Confirmation</h1>
      <p>Dear ${meeting.guestName},</p>
      <p>Your meeting has been successfully scheduled. Here are the details:</p>
      <ul>
        <li><strong>Meeting Title:</strong> ${meeting.title}</li>
        <li><strong>Date:</strong> ${meetingDate}</li>
        <li><strong>Time:</strong> ${meeting.startTime}</li>
        <li><strong>Duration:</strong> ${meeting.duration} minutes</li>
      </ul>
      ${meeting.description ? `<p><strong>Description:</strong> ${meeting.description}</p>` : ''}
      <p>If you need to reschedule or have any questions, please contact us.</p>
      <p>Thank you for choosing our service!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    // console.log(`Meeting confirmation email sent to ${meeting.guestEmail}`);
  } catch (error) {
    console.error('Error sending meeting confirmation email:', error);
  }
}

// Add new SMS sending function
async function sendMeetingSMS(meeting) {
  try {
    const meetingDate = new Date(meeting.date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });

    // Format the phone number to E.164 format
    const formattedPhone = meeting.guestPhone.startsWith('+') 
      ? meeting.guestPhone 
      : `+91${meeting.guestPhone}`; // Add India country code

    const message = `
Hi ${meeting.guestName},
Your meeting "${meeting.title}" has been scheduled for ${meetingDate} at ${meeting.startTime}.
Duration: ${meeting.duration} minutes.
Thank you for choosing our service!`;

    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });
    
    // console.log(`Meeting confirmation SMS sent to ${formattedPhone}`);
  } catch (error) {
    console.error('Error sending meeting confirmation SMS:', error);
  }
}

// Add WhatsApp sending function
async function sendWhatsAppMessage(meeting) {
  try {
    const meetingDate = new Date(meeting.date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });

    // Format the phone number
    const formattedPhone = meeting.guestPhone.startsWith('+') 
      ? meeting.guestPhone 
      : `+91${meeting.guestPhone}`;

    const message = `
Hello ${meeting.guestName}! 👋

Your meeting has been scheduled successfully ✅

*Meeting Details:*
📌 Title: ${meeting.title}
📅 Date: ${meetingDate}
⏰ Time: ${meeting.startTime}
⏱️ Duration: ${meeting.duration} minutes

Thank you for choosing our service! If you need to make any changes, please contact us.`;

    await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedPhone}`
    });

    // console.log(`WhatsApp message sent to ${formattedPhone}`);
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
  }
}

// Get all meetings
router.get('/meetings', async (req, res) => {
  try {
    const meetings = await Meeting.find()
      .populate('organizer', 'name email')
      .populate('attendees', 'name email');
    res.status(200).json({ success: true, meetings });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;