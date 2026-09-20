const User = require("../models/User");
const bcrypt = require("bcryptjs");

const seedAdmin = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@pos.com").toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || "admin12345";

    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      console.log(`Creating default ADMIN account (${adminEmail})...`);
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      adminUser = await User.create({
        name: "System Administrator",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        isActive: true,
      });

      console.log(`Default ADMIN account created: ${adminUser.email}`);
    } else {
      // Ensure existing admin account is active and has proper role
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      adminUser.password = hashedPassword;
      adminUser.role = "ADMIN";
      adminUser.isActive = true;
      await adminUser.save();
      console.log(`Default ADMIN account updated and active: ${adminUser.email}`);
    }
  } catch (error) {
    console.error("Error seeding admin user:", error.message);
  }
};

module.exports = seedAdmin;
