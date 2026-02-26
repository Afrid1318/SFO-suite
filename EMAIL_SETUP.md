# Email Configuration Guide

## Overview
The SFO Meeting Suite application now supports automated email notifications for booking confirmations, approvals, and rejections.

## Email Features

### User Features
- **Booking Confirmation**: Users receive an email when they submit a booking request (status: PENDING)
- **Approval Notification**: Automatic email when admin approves a booking (status: APPROVED)
- **Rejection Notification**: Automatic email when admin rejects a booking (status: REJECTED)

### Admin Features
- **Manual Email Send**: Admin can manually send booking confirmation emails with PDF attachments
- **Email with PDF**: Each email includes a professionally formatted PDF attachment with booking details
- **Batch Notifications**: Automatic emails sent when approving/rejecting bookings

## Setup Instructions

### Option 1: Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other" (enter "SFO Meeting Suite")
   - Copy the 16-character password

3. **Update .env file**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-char-app-password
   EMAIL_FROM=SFO Meeting Suite <your-email@gmail.com>
   ```

### Option 2: Microsoft 365 / Outlook

```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
EMAIL_FROM=SFO Meeting Suite <your-email@outlook.com>
```

### Option 3: Custom SMTP Server

```env
EMAIL_HOST=smtp.your-domain.com
EMAIL_PORT=587
EMAIL_USER=noreply@your-domain.com
EMAIL_PASS=your-smtp-password
EMAIL_FROM=SFO Meeting Suite <noreply@your-domain.com>
```

## Testing Email Configuration

1. **Restart the server** after updating .env:
   ```bash
   npm start
   ```

2. **Check server logs** for email configuration status:
   - ✅ Email configured successfully
   - ⚠️ Email not configured - features will be disabled

3. **Test email sending**:
   - Login as admin
   - Go to Admin Control Panel
   - Find any booking
   - Click "📧 Email" button
   - Check if email is received

## Email Templates

The application sends HTML-formatted emails with:
- Professional header with SFO branding
- Complete booking details in a table format
- Status badges (Pending/Approved/Rejected)
- PDF attachment with booking confirmation
- Footer with timestamp

## Troubleshooting

### Email not sending?

1. **Check .env configuration**
   - Verify EMAIL_USER and EMAIL_PASS are correct
   - Ensure no extra spaces or quotes

2. **Check server logs**
   ```
   ❌ Email send failed: [error message]
   ```

3. **Common issues**:
   - Gmail: Use App Password, not regular password
   - Outlook: Enable "Less secure app access" if required
   - Corporate email: Check firewall/proxy settings
   - Port blocked: Try port 465 with `secure: true`

4. **Update config/email.js** if needed:
   ```javascript
   return nodemailer.createTransporter({
     host: process.env.EMAIL_HOST,
     port: 465,
     secure: true, // Use SSL
     auth: {
       user: process.env.EMAIL_USER,
       pass: process.env.EMAIL_PASS
     }
   });
   ```

### Emails going to spam?

1. **Use a verified domain** for EMAIL_FROM
2. **Set up SPF and DKIM** records for your domain
3. **Use a dedicated email service** (SendGrid, AWS SES, etc.)

## Disabling Email Features

If you don't want email functionality:
- Leave EMAIL_USER as `your-email@gmail.com` in .env
- The application will detect this and disable email features
- All other features will work normally
- Admins can still manually compose emails using the "Email" button

## Production Recommendations

For production environments:

1. **Use a dedicated email service**:
   - SendGrid (https://sendgrid.com)
   - AWS SES (https://aws.amazon.com/ses/)
   - Mailgun (https://www.mailgun.com)

2. **Set up email templates** in a dedicated service

3. **Monitor email delivery rates**

4. **Implement email queue** for high-volume scenarios

5. **Add unsubscribe links** for compliance

## Support

For issues with email configuration:
1. Check server console logs
2. Verify SMTP credentials
3. Test with a different email provider
4. Contact your IT administrator for corporate email settings
