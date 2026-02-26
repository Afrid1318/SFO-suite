const nodemailer = require("nodemailer");

/* ===============================
   EMAIL TRANSPORTER CONFIG
================================ */
const createTransporter = () => {
  // Check if email is configured
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
    console.warn("⚠️  Email not configured. Email features will be disabled.");
    return null;
  }

  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const transporter = createTransporter();

/* ===============================
   SEND BOOKING CONFIRMATION EMAIL
================================ */
async function sendBookingConfirmation(booking, pdfBuffer = null) {
  if (!transporter) {
    console.log("Email not configured - skipping email send");
    return { success: false, message: "Email not configured" };
  }

  const statusText = booking.status === "APPROVED" ? "approved" : 
                     booking.status === "REJECTED" ? "rejected" : "submitted";
  
  const subject = `Meeting Room Booking ${statusText.charAt(0).toUpperCase() + statusText.slice(1)} - ${booking.room}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #e2e8f0; }
        .detail-row:last-child { border-bottom: none; }
        .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 12px; }
        .status-approved { background: #ecfdf5; color: #15803d; }
        .status-pending { background: #fff7ed; color: #c2410c; }
        .status-rejected { background: #fef2f2; color: #b91c1c; }
        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏢 SFO Meeting Suite</h1>
          <p>Booking Confirmation</p>
        </div>
        <div class="content">
          <h2>Hello ${booking.user || "Team"}!</h2>
          <p>Your meeting room booking has been <strong>${statusText}</strong>.</p>
          
          <div class="booking-details">
            <h3>Booking Details</h3>
            <div class="detail-row">
              <strong>Tracking ID:</strong>
              <span>${booking.trackId}</span>
            </div>
            <div class="detail-row">
              <strong>Room:</strong>
              <span>${booking.room}</span>
            </div>
            <div class="detail-row">
              <strong>Division:</strong>
              <span>${booking.division}</span>
            </div>
            <div class="detail-row">
              <strong>Team:</strong>
              <span>${booking.team || "-"}</span>
            </div>
            <div class="detail-row">
              <strong>Date:</strong>
              <span>${booking.date}</span>
            </div>
            <div class="detail-row">
              <strong>Time:</strong>
              <span>${booking.start} - ${booking.end}</span>
            </div>
            <div class="detail-row">
              <strong>Attendees:</strong>
              <span>${booking.attendees || 0}</span>
            </div>
            <div class="detail-row">
              <strong>Meeting Type:</strong>
              <span>${booking.meetingType || "N/A"}</span>
            </div>
            <div class="detail-row">
              <strong>Status:</strong>
              <span class="status-badge status-${booking.status.toLowerCase()}">${booking.status}</span>
            </div>
          </div>
          
          ${booking.status === "PENDING" ? 
            '<p><em>Your booking is pending admin approval. You will receive another email once it has been reviewed.</em></p>' : ''}
          
          ${booking.status === "APPROVED" ? 
            '<p><strong>Your booking has been confirmed!</strong> Please find the booking confirmation attached.</p>' : ''}
          
          ${booking.status === "REJECTED" ? 
            '<p>We apologize, but your booking request has been rejected. Please contact the admin for more information or try booking a different time slot.</p>' : ''}
          
          <div class="footer">
            <p>This is an automated message from SFO Meeting Suite.</p>
            <p>For support, please contact your system administrator.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"SFO Meeting Suite" <noreply@sfosuites.com>',
    to: booking.email,
    subject: subject,
    html: html,
    attachments: pdfBuffer ? [{
      filename: `SFO_Booking_${booking.trackId}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    }] : []
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email send failed:", error);
    return { success: false, error: error.message };
  }
}

/* ===============================
   SEND COMPLAINT CONFIRMATION EMAIL
================================ */
async function sendComplaintConfirmation(complaint, pdfBuffer = null) {
  if (!transporter) {
    console.log("Email not configured - skipping email send");
    return { success: false, message: "Email not configured" };
  }

  const statusText = complaint.status === "APPROVED" ? "resolved" : 
                     complaint.status === "REJECTED" ? "rejected" : "submitted";
  
  const subject = `Complaint ${statusText.charAt(0).toUpperCase() + statusText.slice(1)} - ${complaint.subject}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .complaint-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #e2e8f0; }
        .detail-row:last-child { border-bottom: none; }
        .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 12px; }
        .status-approved { background: #ecfdf5; color: #15803d; }
        .status-pending { background: #fff7ed; color: #c2410c; }
        .status-rejected { background: #fef2f2; color: #b91c1c; }
        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏢 SFO Meeting Suite</h1>
          <p>Complaint Response</p>
        </div>
        <div class="content">
          <h2>Hello ${complaint.user}!</h2>
          <p>Your complaint has been <strong>${statusText}</strong>.</p>
          
          <div class="complaint-details">
            <h3>Complaint Details</h3>
            <div class="detail-row">
              <strong>Subject:</strong>
              <span>${complaint.subject}</span>
            </div>
            <div class="detail-row">
              <strong>Description:</strong>
              <span>${complaint.description}</span>
            </div>
            <div class="detail-row">
              <strong>Submitted By:</strong>
              <span>${complaint.user}</span>
            </div>
            <div class="detail-row">
              <strong>Email:</strong>
              <span>${complaint.email}</span>
            </div>
            <div class="detail-row">
              <strong>Status:</strong>
              <span class="status-badge status-${complaint.status.toLowerCase()}">${complaint.status}</span>
            </div>
          </div>
          
          ${complaint.status === "PENDING" ? 
            '<p><em>Your complaint is pending review. You will receive another email once it has been addressed.</em></p>' : ''}
          
          ${complaint.status === "APPROVED" ? 
            '<p><strong>Your complaint has been resolved!</strong> Please find the confirmation attached.</p>' : ''}
          
          ${complaint.status === "REJECTED" ? 
            '<p>We apologize, but your complaint has been rejected. Please contact the admin for more information.</p>' : ''}
          
          <div class="footer">
            <p>This is an automated message from SFO Meeting Suite.</p>
            <p>For support, please contact your system administrator.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"SFO Meeting Suite" <noreply@sfosuites.com>',
    to: complaint.email,
    subject: subject,
    html: html,
    attachments: pdfBuffer ? [{
      filename: `SFO_Complaint_${complaint._id}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    }] : []
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Complaint email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Complaint email send failed:", error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendBookingConfirmation,
  sendComplaintConfirmation,
  isEmailConfigured: () => transporter !== null
};
