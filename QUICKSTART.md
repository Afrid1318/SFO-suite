# Quick Start Guide

## Prerequisites Check

Before running the application, ensure you have MongoDB running. Choose one option:

### Option 1: Local MongoDB

1. Install MongoDB Community Edition from https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   - **Windows**: MongoDB should start automatically as a service
   - **Mac**: `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

3. Verify MongoDB is running:
```bash
mongosh
```
If you see a MongoDB shell prompt, it's working!

### Option 2: MongoDB Atlas (Cloud)

1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)
4. Update `.env` file:
```env
MONGO_URI=mongodb+srv://your-connection-string-here
```

## Running the Application

### Step 1: Install Dependencies (Already Done)
```bash
cd SFO-Meeting-Suite
npm install
```

### Step 2: Seed Database with Test Users
```bash
npm run seed
```

**Expected Output:**
```
✅ MongoDB connected
✅ Cleared existing users
✅ Created test users:
   Admin: admin@nestgroup.net / admin123
   User: john@nestgroup.net / user123
   User: sarah@nestgroup.net / user123
   User: mike@nestgroup.net / user123
```

### Step 3: Start the Server
```bash
npm start
```

**Expected Output:**
```
✅ MongoDB connected
✅ Server running on http://localhost:3001
```

### Step 4: Open in Browser
Navigate to: **http://localhost:3001**

## Test Credentials

### Admin Account
- **Email**: admin@nestgroup.net
- **Password**: admin123
- **Access**: Full admin panel with approve/reject/delete powers

### User Accounts
- **Email**: john@nestgroup.net / sarah@nestgroup.net / mike@nestgroup.net
- **Password**: user123 (all users)
- **Access**: Booking and tracking

## Common Issues

### ❌ "MongoDB connection error"
**Solution**: 
- Ensure MongoDB is running (see Prerequisites above)
- Check `MONGO_URI` in `.env` file
- For local: Use `mongodb://localhost:27017/sfo-meeting-suite`
- For Atlas: Use your connection string

### ❌ "Port 3001 already in use"
**Solution**:
- Kill the process using port 3001
- OR change port in `server.js`:
```javascript
const PORT = 3002; // Change to any available port
```

### ❌ "Cannot find module"
**Solution**:
```bash
cd SFO-Meeting-Suite
npm install
```

### ❌ Login not working
**Solution**:
- Run `npm run seed` to create test users
- Clear browser cache and localStorage
- Check browser console for errors

## Features to Test

1. ✅ **Login** - Use admin@nestgroup.net / admin123
2. ✅ **Book Room** - Select IT division, choose a room, pick date/time
3. ✅ **Track Booking** - Use your tracking ID (e.g., SFO1738742400000)
4. ✅ **Admin Panel** - Approve/Reject bookings
5. ✅ **PDF Download** - Generate booking confirmation
6. ✅ **Email** - Send confirmation via email client

## Development Mode

For auto-reload during development:
```bash
npm run dev
```

This uses `nodemon` to automatically restart the server when files change.

## Next Steps

1. Customize divisions and rooms in `public/js/data.js`
2. Update branding (logo, colors) in `public/css/styles.css`
3. Configure Google OAuth (optional) in `.env`
4. Deploy to production (Vercel, Railway, Render, etc.)

## Support

If you encounter any issues:
1. Check the console for error messages
2. Review `FIXES_APPLIED.md` for details on what was fixed
3. Check `README.md` for comprehensive documentation

---

**Happy Booking! 🎉**
