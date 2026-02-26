# MongoDB Setup Guide

MongoDB is **not installed** on your system. Choose one of these options:

---

## ✅ OPTION 1: MongoDB Atlas (Cloud) - **RECOMMENDED** ⭐

**Why?** Free, no installation, works immediately, 512MB storage free forever.

### Step-by-Step Setup (5 minutes)

#### 1. Create Free Account
Go to: **https://www.mongodb.com/cloud/atlas/register**
- Sign up with email or Google
- Select "Free" tier (M0)

#### 2. Create a Cluster
- Click "Build a Database"
- Choose **FREE** (Shared) tier
- Select closest region (e.g., AWS - US East)
- Click "Create Deployment"

#### 3. Create Database User
- Username: `sfouser`
- Password: `sfopassword123` (or create your own)
- Click "Create Database User"

#### 4. Set Network Access
- Click "Add IP Address"
- Click "Allow Access from Anywhere" (for development)
- Click "Confirm"

#### 5. Get Connection String
- Click "Connect" on your cluster
- Choose "Connect your application"
- Select "Node.js" and version "6.7 or later"
- Copy the connection string (looks like):
  ```
  mongodb+srv://sfouser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
  ```

#### 6. Update .env File
Replace `<password>` with your actual password:

```env
MONGO_URI=mongodb+srv://sfouser:sfopassword123@cluster0.xxxxx.mongodb.net/sfo-meeting-suite?retryWrites=true&w=majority
SESSION_SECRET=sfo_secret_key_change_in_production_2024
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

#### 7. Install MongoDB Node.js Driver (if not already)
```bash
cd SFO-Meeting-Suite
npm install
```

#### 8. Seed Database
```bash
npm run seed
```

#### 9. Start Application
```bash
npm start
```

**Expected Output:**
```
✅ MongoDB connected
✅ Server running on http://localhost:3001
```

---

## OPTION 2: Local MongoDB Installation

### For Windows

#### Method A: MongoDB Community Edition (Full Install)

1. **Download MongoDB**
   - Go to: https://www.mongodb.com/try/download/community
   - Select: Windows, MSI installer
   - Download and run installer

2. **Install with defaults**
   - Choose "Complete" installation
   - ✅ Check "Install MongoDB as a Service"
   - ✅ Check "Install MongoDB Compass" (GUI tool)

3. **Verify Installation**
   ```powershell
   mongod --version
   ```

4. **Start MongoDB Service** (if not auto-started)
   ```powershell
   net start MongoDB
   ```

5. **Update .env**
   ```env
   MONGO_URI=mongodb://localhost:27017/sfo-meeting-suite
   ```

6. **Seed and Start**
   ```bash
   cd SFO-Meeting-Suite
   npm run seed
   npm start
   ```

#### Method B: MongoDB via Chocolatey (Easier)

1. **Install Chocolatey** (if not installed)
   Open PowerShell as Administrator:
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```

2. **Install MongoDB**
   ```powershell
   choco install mongodb
   ```

3. **Start MongoDB**
   ```powershell
   mongod
   ```
   Keep this terminal open!

4. **In NEW terminal, seed and start**
   ```bash
   cd SFO-Meeting-Suite
   npm run seed
   npm start
   ```

---

## 🚨 Quick Troubleshooting

### "MongoServerSelectionError: connect ECONNREFUSED"
**Cause**: MongoDB is not running or wrong connection string

**Fix for Local**:
1. Start MongoDB service:
   ```powershell
   net start MongoDB
   ```

**Fix for Atlas**:
1. Check connection string in `.env`
2. Verify password is correct (no `<` `>` brackets)
3. Check network access allows your IP

### "Authentication failed"
**Fix**:
- For Atlas: Verify username/password are correct
- For Local: Remove auth from connection string:
  ```env
  MONGO_URI=mongodb://localhost:27017/sfo-meeting-suite
  ```

### "Server selection timeout"
**Fix**:
- For Atlas: Check internet connection
- For Local: Verify MongoDB service is running

---

## 📊 Verify MongoDB is Working

### For MongoDB Atlas:
1. Go to Atlas dashboard
2. Click "Browse Collections"
3. You should see `sfo-meeting-suite` database
4. Collections: `users`, `bookings`

### For Local MongoDB:
1. Open MongoDB Compass (GUI tool)
2. Connect to `mongodb://localhost:27017`
3. Look for `sfo-meeting-suite` database

---

## 🎯 Recommended: MongoDB Atlas

**Pros**:
- ✅ No installation needed
- ✅ Free 512MB storage
- ✅ Automatic backups
- ✅ Works from anywhere
- ✅ Easy to share with team
- ✅ Production-ready

**Cons**:
- Requires internet connection

---

## Need Help?

### Test Connection
After setup, run:
```bash
cd SFO-Meeting-Suite
npm run seed
```

**Success Looks Like:**
```
✅ MongoDB connected
✅ Cleared existing users
✅ Created test users:
   Admin: admin@nestgroup.net / admin123
   ...
```

**Failure Looks Like:**
```
❌ MongoDB error: connect ECONNREFUSED
```

If you see failure, double-check:
1. Connection string in `.env`
2. MongoDB service is running (local) or cluster is active (Atlas)
3. Network access is configured (Atlas)

---

**Choose Option 1 (MongoDB Atlas) for fastest setup!**
