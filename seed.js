require("dotenv").config();
require("./config/db");

const User = require("./models/User");

async function seed() {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log("✅ Cleared existing users");

    // Create test users
    const users = [
      {
        username: "user1",
        email: "user1@nestgroup.net",
        password: "User@12345",
        role: "user"
      },
      {
        username: "user2",
        email: "user2@nestgroup.net",
        password: "User@12345",
        role: "user"
      },
      {
        username: "admin",
        email: "admin@nestgroup.net",
        password: "Admin@12345",
        role: "admin"
      }
    ];

    await User.insertMany(users);
    console.log("✅ Created test users:");
    console.log("   User1: user1@nestgroup.net / User@12345");
    console.log("   User2: user2@nestgroup.net / User@12345");
    console.log("   Admin: admin@nestgroup.net / Admin@12345");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seed();
