const bcrypt = require("bcrypt");
const User = require("../models/User");

const DEFAULT_USERS = [
  // ── 👑 System Administrator ────────────────────────────────────────────────
  {
    name: "Administrator",
    email: "admin@cinebook.com",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Administrator",
    email: "admin@flickticket.com",
    password: "admin123",
    role: "admin",
  },

  // ── 🎟️ Auditorium Gate Staff ───────────────────────────────────────────────
  {
    name: "Auditorium Gate Staff",
    email: "staff@cinebook.com",
    password: "staff123",
    role: "staff",
  },
  {
    name: "Auditorium Gate Staff",
    email: "staff@flickticket.com",
    password: "staff123",
    role: "staff",
  },

  // ── 🍿 Moviegoer Customer ──────────────────────────────────────────────────
  {
    name: "Moviegoer Customer",
    email: "customer@cinebook.com",
    password: "password123",
    role: "user",
  },
  {
    name: "Moviegoer Customer",
    email: "customer@flickticket.com",
    password: "password123",
    role: "user",
  },

  // ── 🌟 Project Author Account ─────────────────────────────────────────────
  {
    name: "Lithish Kumar",
    email: "lithish.google@gmail.com",
    password: "password123",
    role: "admin",
  },
];

async function seedDefaultUsers() {
  try {
    for (const u of DEFAULT_USERS) {
      const emailLower = u.email.toLowerCase();
      const existing = await User.findOne({
        email: { $regex: new RegExp(`^${emailLower}$`, "i") },
      });

      const hashedPassword = await bcrypt.hash(u.password, 10);

      if (!existing) {
        await User.create({
          name: u.name,
          email: emailLower,
          password: hashedPassword,
          role: u.role,
        });
        console.log(`✅ Default user created: ${emailLower} [${u.role}]`);
      } else {
        // Guarantee password and role are in sync with rubric credentials
        existing.password = hashedPassword;
        existing.role = u.role;
        existing.name = u.name;
        await existing.save();
        console.log(`🔒 Verified & synchronized user: ${emailLower} [${u.role}]`);
      }
    }
    console.log("✅ All assessment accounts (Admin, Staff, Customer) ready in MongoDB.");
  } catch (err) {
    console.error("❌ Error in seedDefaultUsers:", err.message);
  }
}

module.exports = { seedDefaultUsers, DEFAULT_USERS };

