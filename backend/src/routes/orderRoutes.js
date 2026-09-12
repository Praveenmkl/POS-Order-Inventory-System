const express = require("express");

const {
  checkout,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} = require("../controlllers/orderController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// User routes
router.post("/checkout", protect, checkout);
router.get("/my-orders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.patch("/:id/cancel", protect, cancelOrder);

// Admin routes
router.get("/", protect, getAllOrders);
router.patch("/:id/status", protect, updateOrderStatus);

module.exports = router;