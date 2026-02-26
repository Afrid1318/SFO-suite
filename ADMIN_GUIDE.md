# SFO Meeting Suite - Admin Guide

## Quick Start for Admins

### Logging In
1. Go to the application homepage
2. Login with your admin credentials
3. You'll be redirected to the admin control panel

### Admin Dashboard Features

#### 1. **View All Booking Requests**
- All bookings are displayed in the Admin Control Panel
- Shows: Room, Team, Date, Time, User, Status
- Latest bookings appear first

#### 2. **Approve or Reject Bookings**
- **Approve**: Click the "✅ Approve" button
  - Changes status to APPROVED
  - Sends automatic email notification to user
  - User receives email with booking confirmation
  
- **Reject**: Click the "❌ Reject" button
  - Changes status to REJECTED
  - Sends automatic email notification to user
  - User receives email with rejection notice

#### 3. **Generate PDF Confirmations**
- Click the "📄 PDF" button on any booking
- Downloads a professionally formatted PDF with:
  - SFO Meeting Suite branding
  - Complete booking details
  - Tracking ID for reference
  - Timestamp
  
#### 4. **Send Email with PDF**
- Click the "📧 Email" button on any booking
- System will:
  1. Generate a PDF confirmation
  2. Send email to the booking user
  3. Attach the PDF to the email
  4. Show success/error notification
  
- Email includes:
  - Professional HTML formatting
  - Complete booking details
  - Status badge (Pending/Approved/Rejected)
  - PDF attachment

#### 5. **Delete Bookings**
- Click the "🗑 Delete" button
- Confirmation dialog appears
- Permanently removes the booking from database
- **Warning**: This action cannot be undone

#### 6. **Book Meeting Rooms as Admin**
- Navigate to "New Booking" from the sidebar
- Fill in the booking form (same as regular users)
- Select division, room, date, time, etc.
- Submit booking
- Your booking will be created with PENDING status
- You can then approve your own booking if needed

#### 7. **Create New Users**
- Scroll to "User Management" section
- Fill in the form:
  - Username
  - Email (must be @nestgroup.net)
  - Password
  - Role (User or Admin)
- Click "Create User"
- New user can now login to the system

#### 8. **Refresh Bookings**
- Click "Refresh Requests" button in the hero section
- Reloads all bookings from the database
- Use this to see latest updates

### Admin Workflow Examples

#### Scenario 1: Regular Booking Approval
1. User submits a booking request
2. Admin sees it in Admin Control Panel (Status: PENDING)
3. Admin clicks "✅ Approve"
4. Status changes to APPROVED
5. User receives automatic email with confirmation
6. Admin can optionally send PDF via "📧 Email" button

#### Scenario 2: Booking with PDF Email
1. Admin finds an approved booking
2. Clicks "📧 Email" button
3. System generates PDF and sends email
4. User receives email with PDF attachment
5. Toast notification confirms email sent

#### Scenario 3: Admin Booking a Room
1. Admin clicks "New Booking" in sidebar
2. Selects division and meeting details
3. Chooses available room
4. Sets date, time, and attendees
5. Clicks "Confirm Booking"
6. Sees confirmation page (Status: PENDING)
7. Goes to Admin Panel
8. Approves own booking
9. Now booking is APPROVED

#### Scenario 4: Rejecting a Booking
1. Admin reviews booking request
2. Decides to reject (conflict, policy, etc.)
3. Clicks "❌ Reject"
4. Confirms the action
5. User receives automatic rejection email
6. Booking status changes to REJECTED

### Email Configuration

**Important**: Email features require SMTP configuration.

1. **Edit `.env` file**:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=SFO Meeting Suite <your-email@gmail.com>
   ```

2. **For Gmail**:
   - Enable 2-Factor Authentication
   - Generate App Password at: https://myaccount.google.com/apppasswords
   - Use the 16-character password in EMAIL_PASS

3. **Restart the server** after updating .env:
   ```bash
   npm start
   ```

4. **Test email** by clicking "📧 Email" on any booking

See `EMAIL_SETUP.md` for detailed email configuration instructions.

### Email Features

✅ **Automatic Emails** (no action required):
- User books → Receives "Booking Submitted" email
- Admin approves → User receives "Booking Approved" email
- Admin rejects → User receives "Booking Rejected" email

✅ **Manual Emails** (admin action required):
- Click "📧 Email" button → Sends email with PDF attachment

### Troubleshooting

#### Emails not sending?
- Check `.env` configuration
- Verify EMAIL_USER and EMAIL_PASS are correct
- See server console for error messages
- Check EMAIL_SETUP.md for detailed setup

#### Bookings not showing?
- Click "Refresh Requests" button
- Check browser console for errors
- Verify MongoDB connection

#### Can't approve/reject?
- Ensure you're logged in as admin
- Check that booking exists in database
- Refresh the page and try again

#### PDF not downloading?
- Check if jsPDF library is loaded
- Check browser console for errors
- Try refreshing the page

### Best Practices

1. **Review bookings promptly** - Users are waiting for approval
2. **Send email confirmations** - Helps users have a record
3. **Delete old bookings** - Keep database clean
4. **Use PDF for records** - Archive important bookings
5. **Create users carefully** - Verify email addresses
6. **Test email first** - Ensure email is configured correctly

### Security Notes

- Only admins can approve/reject bookings
- Only admins can delete bookings
- Only admins can send emails
- Only admins can create new users
- Regular users can only:
  - Book meeting rooms
  - View their own bookings
  - Download their booking PDF
  - Track their bookings by ID

### Support & Help

For technical issues:
1. Check server console logs
2. Check browser console (F12)
3. Verify database connection
4. Restart the server
5. Check EMAIL_SETUP.md for email issues
6. See FEATURES_CHANGELOG.md for recent updates

### Admin Navigation

**Sidebar Menu**:
- 🏠 **Home** - Main dashboard
- 📊 **Room Dashboard** - Live status of rooms
- ➕ **New Booking** - Book a meeting room (admin can book too!)
- 🔍 **Track Status** - Track booking by ID
- 📂 **Booking History** - View archived bookings
- 📈 **Analytics** - View booking analytics
- 🔐 **Logout** - Sign out of admin panel

---

**Remember**: Admins have full control over bookings and can perform all actions that users can, plus additional administrative functions.
