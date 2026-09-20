const express = require("express");

const {
  checkout,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  refundOrder,
} = require("../controllers/orderController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// User routes
router.post("/checkout", protect, checkout);
router.get("/my-orders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.patch("/:id/cancel", protect, cancelOrder);
router.post("/:id/refund", protect, refundOrder);

// Admin routes
router.get("/", protect, authorizeRoles("admin"), getAllOrders);
router.patch("/:id/status", protect, authorizeRoles("admin"), updateOrderStatus);

module.exports = router;