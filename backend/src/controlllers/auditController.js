const AuditLog = require("../models/AuditLog");

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().populate("user", "name email").sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch audit logs", error: error.message });
  }
};

exports.createAuditLog = async (userId, action, details) => {
  try {
    await AuditLog.create({ user: userId, action, details });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
};
