const express = require("express");

const { checkout } = require("../controlllers/orderController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/checkout", protect, checkout);

module.exports = router;