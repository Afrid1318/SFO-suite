# SFO Meeting Suite

Enterprise meeting room booking and management system built with Node.js, Express, and MongoDB.

## Features

- ✅ User authentication (local & Google OAuth)
- ✅ Meeting room booking with conflict detection
- ✅ Real-time booking dashboard
- ✅ Admin panel for approvals
- ✅ PDF generation for confirmations
- ✅ Email notifications
- ✅ Booking tracking system
- ✅ Division-based room organization

## Prerequisites

- Node.js >= 18.0.0
- MongoDB connection (see setup below)
- npm or yarn

## 🚀 Quick Start

### 1. MongoDB Setup (REQUIRED)

**MongoDB is not installed?** No problem! Use MongoDB Atlas (free cloud database).

📖 **Follow the setup guide**: [MONGODB_QUICK_SETUP.md](MONGODB_QUICK_SETUP.md)

Or run the automated helper:
```bash
cd SFO-Meeting-Suite
powershell -ExecutionPolicy Bypass -File setup-mongodb.ps1
```

**After MongoDB setup**, update your `.env` file with the connection string.

### 2. Install Dependencies
```bash
cd SFO-Meeting-Suite
npm install
```

### 3. Seed Database with Test Users
```bash
npm run seed
```

**Test Accounts Created:**
- **Admin**: admin@nestgroup.net / admin123
- **User**: john@nestgroup.net / user123
- **User**: sarah@nestgroup.net / user123
- **User**: mike@nestgroup.net / user123

### 4. Start the Server
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### 5. Open in Browser
```
http://localhost:3001
```

## Project Structure

```
SFO-Meeting-Suite/
├── config/          # Database and passport configuration
├── middleware/      # Authentication middleware
├── models/          # MongoDB schemas (User, Booking)
├── routes/          # API endpoints
├── public/          # Frontend files
│   ├── css/        # Stylesheets
│   ├── js/         # Client-side JavaScript
│   ├── assets/     # Images and icons
│   └── *.html      # Application pages
├── .env            # Environment variables
├── server.js       # Express server
└── seed.js         # Database seeding script
```

## Usage

### For Users

1. **Login**: Use your credentials at `/index.html`
2. **Book a Room**: Select division, room, date, and time
3. **Track Booking**: Use your tracking ID to check status
4. **Dashboard**: View all your bookings and availability

### For Admins

1. **Login**: Use admin credentials
2. **Admin Panel**: Automatically redirected to `/admin.html`
3. **Manage Bookings**: Approve, reject, or delete requests
4. **Generate PDFs**: Download booking confirmations
5. **Send Emails**: Email confirmations to users

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/google` - Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get all bookings (admin only)
- `PUT /api/bookings/:id` - Update booking status (admin only)
- `PUT /api/bookings/:id/status` - Update booking status (admin only)
- `DELETE /api/bookings/:id` - Delete booking (admin only)

### Admin
- `GET /admin/users/users` - Get all users (admin only)
- `POST /admin/users/users` - Create user (admin only)
- `PUT /admin/users/users/:id` - Update user role (admin only)
- `DELETE /admin/users/users/:id` - Delete user (admin only)
- `GET /admin/analytics` - Get booking analytics (admin only)

## Divisions & Rooms

The system organizes rooms by division:

- **IT**: 4 rooms (Conference, Meeting 1, Meeting 2, Training)
- **HR**: 4 rooms (Conference, Interview 1, Interview 2, Training)
- **Finance**: 3 rooms (Board, Meeting, Conference)
- **Marketing**: 3 rooms (Creative, Meeting, Presentation)
- **Operations**: 3 rooms (Conference, Meeting 1, Meeting 2)
- **Sales**: 4 rooms (Conference, Meeting 1, Meeting 2, Pitch)

## Features in Detail

### Booking System
- Conflict detection prevents double bookings
- Real-time availability checking
- Support for recurring meetings
- Attendee and visitor tracking
- Food requirement options

### Admin Panel
- Approve/Reject bookings
- Generate PDF confirmations
- Send email notifications
- View booking history
- Analytics dashboard

### Security
- Session-based authentication
- Password protection
- Admin role verification
- CSRF protection (can be enhanced)

## 📚 Documentation

- **[MONGODB_QUICK_SETUP.md](MONGODB_QUICK_SETUP.md)** - 5-minute MongoDB Atlas setup guide
- **[MONGODB_SETUP.md](MONGODB_SETUP.md)** - Detailed MongoDB setup (Atlas & Local)
- **[QUICKSTART.md](QUICKSTART.md)** - General quick start guide
- **[FIXES_APPLIED.md](FIXES_APPLIED.md)** - Complete list of fixes applied

## Troubleshooting

### ❌ MongoDB Connection Issues

**Error**: "MongoDB connection error" or "MongoServerSelectionError"

**Solution**: 
1. See **[MONGODB_QUICK_SETUP.md](MONGODB_QUICK_SETUP.md)** for step-by-step setup
2. Run `powershell -ExecutionPolicy Bypass -File setup-mongodb.ps1`
3. Verify `MONGO_URI` in `.env` is correct
4. For Atlas: Check username, password, and network access

### Login Issues
- Run `npm run seed` to create test users
- Clear browser cache and localStorage
- Check console for error messages

### Port Already in Use
- Change port in `server.js` (default: 3001)
- Kill process using the port

## Development

To modify the application:

1. **Frontend**: Edit files in `public/` directory
2. **Backend**: Edit files in `routes/`, `models/`, `middleware/`
3. **Styles**: Modify `public/css/styles.css`
4. **Data**: Update `public/js/data.js` for divisions/rooms

## License

This project is proprietary software developed for SFO Technologies.

## Support

For issues or questions, contact the development team.
