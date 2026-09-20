const express = require("express");

const { makePayment } = require("../controllers/paymentController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, makePayment);

module.exports = router;