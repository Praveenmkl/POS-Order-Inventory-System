const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { getDashboardStats } = require("../controlllers/dashboardController");

const router = express.Router();

router.get("/stats", protect, authorizeRoles("admin"), getDashboardStats);

module.exports = router;
