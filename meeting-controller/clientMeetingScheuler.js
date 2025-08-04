const express = require('express');
const router = express.Router();
const Meeting = require('../meeting-model/clientMeetingModel');
const nodemailer = require('nodemailer');
const dotenv = require("dotenv");

dotenv.config();

// Create a meeting (no login required)
router.post('/client-create-meeting', async (req, res) => {
  try {
    // console.log('Received meeting data:', req.body); // Debug log
    
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

    // Create meeting without requiring organizer (for no-login meetings)
    const meetingData = {
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
      agreedToTerms
    };

    // Only add organizer if provided (for logged-in users)
    if (organizer) {
      meetingData.organizer = organizer;
    }

    // console.log('Final meeting data to save:', meetingData); // Debug log

    const meeting = new Meeting(meetingData);
    await meeting.save();
    
    // Send email notifications
    await Promise.all([
      sendMeetingConfirmation(meeting),
      sendAdminNotification(meeting) // Send notification to admin
    ]);
    
    res.status(201).json({ success: true, meeting });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Email sending function for meeting confirmation (to client)
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Meeting Confirmed!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Your consultation call has been successfully scheduled</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Dear <strong>${meeting.guestName}</strong>,</p>
          
          <p style="color: #555; font-size: 14px; line-height: 1.6;">Thank you for scheduling a consultation call with us. We're excited to help you achieve your business goals!</p>
          
          <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin-top: 0;">📅 Meeting Details</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <strong style="color: #667eea;">Meeting Title:</strong><br>
                <span style="color: #555;">${meeting.title}</span>
              </div>
              <div>
                <strong style="color: #667eea;">Date:</strong><br>
                <span style="color: #555;">${meetingDate}</span>
              </div>
              <div>
                <strong style="color: #667eea;">Time:</strong><br>
                <span style="color: #555;">${meeting.startTime}</span>
              </div>
              <div>
                <strong style="color: #667eea;">Duration:</strong><br>
                <span style="color: #555;">${meeting.duration} minutes</span>
              </div>
            </div>
            ${meeting.description ? `
            <div style="margin-top: 15px;">
              <strong style="color: #667eea;">Description:</strong><br>
              <span style="color: #555;">${meeting.description}</span>
            </div>
            ` : ''}
          </div>
          
          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
            <h4 style="color: #17a2b8; margin-top: 0;">💡 What to Expect</h4>
            <ul style="color: #555; padding-left: 20px;">
              <li>We'll discuss your current business challenges</li>
              <li>Review your revenue goals and strategies</li>
              <li>Provide personalized recommendations</li>
              <li>Answer any questions you may have</li>
            </ul>
          </div>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h4 style="color: #856404; margin-top: 0;">⚠️ Important Notes</h4>
            <ul style="color: #856404; padding-left: 20px;">
              <li>Please join the call 5 minutes before the scheduled time</li>
              <li>Ensure you have a stable internet connection</li>
              <li>Have your questions ready for maximum benefit</li>
            </ul>
          </div>
          
          <p style="color: #555; font-size: 14px; line-height: 1.6;">If you need to reschedule or have any questions, please contact us at <a href="mailto:support@yourcompany.com" style="color: #667eea;">support@yourcompany.com</a> or call us at <a href="tel:+1234567890" style="color: #667eea;">+1 (234) 567-890</a>.</p>
          
          <p style="color: #555; font-size: 14px; line-height: 1.6;">We look forward to speaking with you!</p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #6c757d; font-size: 12px; margin: 0;">Best regards,<br>The Team at Your Company</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    // console.log(`Meeting confirmation email sent to ${meeting.guestEmail}`);
  } catch (error) {
    console.error('Error sending meeting confirmation email:', error);
  }
}

// Send notification to admin about new meeting
async function sendAdminNotification(meeting) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASSWORD
    },
  });

  const meetingDate = new Date(meeting.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: process.env.ADMIN_EMAIL || process.env.USER_EMAIL, // Send to admin email
    subject: `New Meeting Scheduled: ${meeting.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">📅 New Meeting Scheduled</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">A new consultation call has been booked</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #333; margin-top: 0;">👤 Client Information</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <strong style="color: #28a745;">Name:</strong><br>
                <span style="color: #555;">${meeting.guestName}</span>
              </div>
              <div>
                <strong style="color: #28a745;">Email:</strong><br>
                <span style="color: #555;">${meeting.guestEmail}</span>
              </div>
              <div>
                <strong style="color: #28a745;">Phone:</strong><br>
                <span style="color: #555;">${meeting.guestPhone}</span>
              </div>
              <div>
                <strong style="color: #28a745;">Meeting Title:</strong><br>
                <span style="color: #555;">${meeting.title}</span>
              </div>
            </div>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
            <h3 style="color: #333; margin-top: 0;">📅 Meeting Details</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <strong style="color: #17a2b8;">Date:</strong><br>
                <span style="color: #555;">${meetingDate}</span>
              </div>
              <div>
                <strong style="color: #17a2b8;">Time:</strong><br>
                <span style="color: #555;">${meeting.startTime}</span>
              </div>
              <div>
                <strong style="color: #17a2b8;">Duration:</strong><br>
                <span style="color: #555;">${meeting.duration} minutes</span>
              </div>
              <div>
                <strong style="color: #17a2b8;">Status:</strong><br>
                <span style="color: #555;">${meeting.status}</span>
              </div>
            </div>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #333; margin-top: 0;">💼 Business Information</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <strong style="color: #ffc107;">Current Revenue:</strong><br>
                <span style="color: #555;">${meeting.currentRevenue}</span>
              </div>
              <div>
                <strong style="color: #ffc107;">Revenue Goal:</strong><br>
                <span style="color: #555;">${meeting.revenueGoal}</span>
              </div>
            </div>
            <div style="margin-top: 15px;">
              <strong style="color: #ffc107;">Business Struggle:</strong><br>
              <span style="color: #555;">${meeting.businessStruggle}</span>
            </div>
          </div>
          
          ${meeting.description ? `
          <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6f42c1;">
            <h3 style="color: #333; margin-top: 0;">📝 Additional Notes</h3>
            <span style="color: #555;">${meeting.description}</span>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #6c757d; font-size: 12px; margin: 0;">Meeting ID: ${meeting._id}</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    // console.log(`Admin notification email sent for meeting ${meeting._id}`);
  } catch (error) {
    console.error('Error sending admin notification email:', error);
  }
}



// Get all meetings (for admin view)
router.get('/client-meetings', async (req, res) => {
  try {
    const meetings = await Meeting.find()
      .sort({ date: 1 }) // Sort by date in ascending order
      .populate('organizer', 'name email'); // Only populate organizer field
    
    res.status(200).json({
      success: true,
      meetings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error fetching meetings: " + error.message
    });
  }
});

// Add this new route for deleting meetings
router.delete('/client-meetings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findById(id);
    
    if (!meeting) {
      return res.status(404).json({ 
        success: false, 
        error: 'Meeting not found' 
      });
    }

    await Meeting.findByIdAndDelete(id);
    
    // Optionally send cancellation notifications
    try {
      await sendStatusUpdateEmail({
        ...meeting.toObject(),
        status: 'cancelled'
      });
    } catch (error) {
      console.error('Error sending cancellation email:', error);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Meeting deleted successfully' 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;