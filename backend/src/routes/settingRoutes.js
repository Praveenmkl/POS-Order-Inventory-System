const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { getSettings, updateSetting } = require("../controlllers/settingController");

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin"));

router.get("/", getSettings);
router.post("/", updateSetting);

module.exports = router;
