const mongoose = require("mongoose");

// Check if MONGO_URI is defined
if (!process.env.MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI is not defined in .env file");
  console.error("📝 Please follow instructions in MONGODB_SETUP.md");
  console.error("🔗 Quick fix: Use MongoDB Atlas (free): https://www.mongodb.com/cloud/atlas");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log(`📦 Database: ${mongoose.connection.name}`);
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("\n🔧 Troubleshooting:");
    console.error("1. Check MONGO_URI in .env file");
    console.error("2. For Atlas: Verify connection string and password");
    console.error("3. For Local: Ensure MongoDB service is running");
    console.error("4. See MONGODB_SETUP.md for detailed instructions");
    console.error("\n📚 Recommended: Use MongoDB Atlas (free cloud database)");
    console.error("   Sign up: https://www.mongodb.com/cloud/atlas/register");
    process.exit(1);
  });
