/**
 * Birinchi ADMIN foydalanuvchini yaratish uchun script
 *
 * Ishlatish:
 *   node src/scripts/seed-admin.js
 *
 * .env da quyidagilar bo'lishi kerak:
 *   MONGO_URL=...
 *   ADMIN_NAME=Super Admin
 *   ADMIN_AGE=25
 *   ADMIN_USERNAME=superadmin
 *   ADMIN_EMAIL=admin@example.com
 *   ADMIN_PASSWORD=Admin123!
 */

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";

const {
  MONGO_URL,
  ADMIN_NAME = "Super Admin",
  ADMIN_AGE = "25",
  ADMIN_USERNAME = "superadmin",
  ADMIN_EMAIL = "admin@example.com",
  ADMIN_PASSWORD,
} = process.env;

if (!MONGO_URL) {
  console.error("❌ MONGO_URL is not set in .env");
  process.exit(1);
}

if (!ADMIN_PASSWORD) {
  console.error("❌ ADMIN_PASSWORD is not set in .env");
  process.exit(1);
}

try {
  await mongoose.connect(MONGO_URL);
  console.log("✅ Connected to DB");

  const existing = await User.findOne({
    $or: [{ username: ADMIN_USERNAME }, { email: ADMIN_EMAIL }],
  });

  if (existing) {
    console.log(`⚠️  Admin already exists: ${existing.username} (${existing.role})`);

    // Agar USER bo'lsa, ADMIN ga o'tkazish
    if (existing.role !== "ADMIN") {
      existing.role = "ADMIN";
      await existing.save();
      console.log(`✅ Role updated to ADMIN for: ${existing.username}`);
    }
  } else {
    const hashedPass = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const admin = await User.create({
      name: ADMIN_NAME,
      age: parseInt(ADMIN_AGE),
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password: hashedPass,
      isActive: true,
      role: "ADMIN",
    });

    console.log(`✅ Admin created successfully!`);
    console.log(`   Username : ${admin.username}`);
    console.log(`   Email    : ${admin.email}`);
    console.log(`   Role     : ${admin.role}`);
  }
} catch (err) {
  console.error("❌ Error:", err.message);
} finally {
  await mongoose.disconnect();
  console.log("🔌 Disconnected from DB");
}
