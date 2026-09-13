const express = require("express");

const {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
} = require("../controlllers/cartController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, addToCart);
router.get("/", protect, getCart);
router.delete("/:productId", protect, removeFromCart);
router.put("/:productId", protect, updateCartItem);

module.exports = router;