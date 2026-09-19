const User = require("../models/Users");
const bcrypt = require("bcryptjs");

const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({
      role: { $in: ["ADMIN", "admin"] },
    });

    if (!existingAdmin) {
      console.log("No ADMIN user found. Seeding default ADMIN account...");

      const adminEmail = (process.env.ADMIN_EMAIL || "admin@pos.com").toLowerCase().trim();
      const adminPassword = process.env.ADMIN_PASSWORD || "admin12345";
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const newAdmin = await User.create({
        name: "System Administrator",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        isActive: true,
      });

      console.log(`Default ADMIN created: ${newAdmin.email}`);
    }
  } catch (error) {
    console.error("Error seeding admin user:", error.message);
  }
};

module.exports = seedAdmin;
