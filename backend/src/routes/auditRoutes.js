const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { getAuditLogs } = require("../controlllers/auditController");

const router = express.Router();

router.get("/", protect, authorizeRoles("admin"), getAuditLogs);

module.exports = router;
