# ⚡ MongoDB Atlas - 5 Minute Setup

MongoDB is **not installed** on your computer. Use MongoDB Atlas (free cloud database) instead!

---

## 🚀 Quick Setup (Follow These Exact Steps)

### Step 1: Create Account (1 min)
1. Go to: **https://www.mongodb.com/cloud/atlas/register**
2. Sign up with your email or Google account
3. Click verification link in your email

### Step 2: Create Free Cluster (2 min)
1. Click **"+ Create"** button
2. Choose **"M0 FREE"** tier (512MB free forever)
3. Select any **Cloud Provider** (AWS recommended)
4. Choose **closest region** to you
5. Cluster Name: Leave as **Cluster0**
6. Click **"Create Deployment"** button
7. **WAIT** for cluster to deploy (30 seconds)

### Step 3: Create Database User (30 sec)
A popup will appear asking you to create a user:

1. **Username**: `sfouser`
2. **Password**: `sfopass123` (or create your own)
3. Click **"Create Database User"**

**⚠️ IMPORTANT: Remember this password!**

### Step 4: Set Network Access (30 sec)
1. Click **"Add IP Address"** or go to "Network Access" tab
2. Click **"Allow Access from Anywhere"** (for development)
3. Click **"Confirm"**

### Step 5: Get Connection String (1 min)
1. Go back to **"Database"** tab
2. Click **"Connect"** button on your cluster
3. Choose **"Drivers"**
4. Select **Node.js** version **6.7 or later**
5. **COPY** the connection string (looks like):
   ```
   mongodb+srv://sfouser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Update .env File
1. Open `SFO-Meeting-Suite/.env` file in your code editor
2. Replace the entire `MONGO_URI` line with your connection string
3. **REPLACE** `<password>` with your actual password (remove the `<` `>` brackets)
4. Add database name at the end

**Example:**
```env
MONGO_URI=mongodb+srv://sfouser:sfopass123@cluster0.abc123.mongodb.net/sfo-meeting-suite?retryWrites=true&w=majority
```

**Make sure to:**
- ✅ Replace `<password>` with actual password
- ✅ Remove `<` and `>` brackets
- ✅ Add `/sfo-meeting-suite` before the `?`
- ✅ No spaces in the connection string

### Step 7: Seed Database
Open terminal and run:
```bash
cd SFO-Meeting-Suite
npm run seed
```

**Expected Output:**
```
✅ MongoDB connected successfully
📦 Database: sfo-meeting-suite
✅ Cleared existing users
✅ Created test users:
   Admin: admin@nestgroup.net / admin123
   User: john@nestgroup.net / user123
   User: sarah@nestgroup.net / user123
   User: mike@nestgroup.net / user123
```

### Step 8: Start Application
```bash
npm start
```

**Expected Output:**
```
✅ MongoDB connected successfully
📦 Database: sfo-meeting-suite
✅ Server running on http://localhost:3001
```

### Step 9: Open Browser
Go to: **http://localhost:3001**

Login with:
- **Email**: admin@nestgroup.net
- **Password**: admin123

---

## 🎯 Your Final .env Should Look Like:

```env
MONGO_URI=mongodb+srv://sfouser:sfopass123@cluster0.xxxxx.mongodb.net/sfo-meeting-suite?retryWrites=true&w=majority
SESSION_SECRET=sfo_secret_key_change_in_production_2024
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

**Replace:**
- `sfouser` - your database username
- `sfopass123` - your database password
- `cluster0.xxxxx.mongodb.net` - your actual cluster URL

---

## ❌ Common Mistakes

### Mistake 1: Forgot to replace `<password>`
❌ **Wrong:**
```
mongodb+srv://sfouser:<password>@cluster0...
```

✅ **Correct:**
```
mongodb+srv://sfouser:sfopass123@cluster0...
```

### Mistake 2: Forgot to add database name
❌ **Wrong:**
```
...mongodb.net/?retryWrites=true
```

✅ **Correct:**
```
...mongodb.net/sfo-meeting-suite?retryWrites=true
```

### Mistake 3: Spaces in connection string
❌ **Wrong:**
```
MONGO_URI = mongodb+srv:// ...
```

✅ **Correct:**
```
MONGO_URI=mongodb+srv://...
```

---

## 🆘 Still Having Issues?

### Error: "Authentication failed"
- ✅ Check username and password are correct
- ✅ Verify you removed `<` `>` brackets
- ✅ Password is case-sensitive

### Error: "Server selection timeout"
- ✅ Check internet connection
- ✅ Verify cluster is active (green in Atlas dashboard)
- ✅ Confirm network access allows connections

### Error: "MONGO_URI is not defined"
- ✅ Make sure `.env` file exists in `SFO-Meeting-Suite/` folder
- ✅ Restart terminal after updating `.env`
- ✅ No quotes around the connection string

---

## 📊 Verify Database

After seeding, verify in MongoDB Atlas:

1. Go to Atlas dashboard
2. Click **"Browse Collections"**
3. You should see:
   - Database: `sfo-meeting-suite`
   - Collections: `users`, `bookings`
   - 4 users in `users` collection

---

## ✨ You're Done!

Now you can:
- ✅ Login with admin account
- ✅ Create bookings
- ✅ Approve/reject bookings
- ✅ Generate PDFs
- ✅ Track bookings

**Database URL works from anywhere** - no need to install MongoDB on your computer!

---

**Need help? See MONGODB_SETUP.md for detailed troubleshooting.**
