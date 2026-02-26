const xlsx = require("xlsx");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();
console.log("URI FOUND:", process.env.MONGO_URI);

const User = require("../models/User");

const EXCEL_PATH = path.join(__dirname, "../data/users.xlsx");
const MONGO_URI = process.env.MONGO_URI;

async function migrateExcelToMongo() {
  try {
    // Connect MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected (migration)");

    // Read Excel
    const workbook = xlsx.readFile(EXCEL_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const users = xlsx.utils.sheet_to_json(sheet);

    if (!users.length) {
      console.log("❌ Excel file is empty");
      process.exit();
    }

    for (const row of users) {
      const username = String(row.username || "").trim();
      const email = String(row.email || "").trim().toLowerCase();
      const password = String(row.password || "").trim();
      const role = String(row.role || "user").toLowerCase();

      if (!username || !email || !password) {
        console.log("⚠️ Skipped invalid row:", row);
        continue;
      }

      const exists = await User.findOne({ email });
      if (exists) {
        console.log(`⚠️ Skipped (already exists): ${email}`);
        continue;
      }

      await User.create({ username, email, password, role });
      console.log(`✅ Inserted: ${email}`);
    }

    console.log("🎉 Excel → MongoDB migration completed");
    await mongoose.disconnect();
    process.exit();

  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrateExcelToMongo();
