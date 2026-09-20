const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Payment = require("../models/Payment");

// Valid status transitions
const VALID_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled", "refunded"],
  processing: ["completed", "refunded"],
  completed: ["refunded"],
  cancelled: [],
  refunded: [],
};

const checkout = async (req, res) => {
  try {
    let cartItemsToProcess = [];

    // 1. If POS sends items in req.body.items, use them
    if (req.body?.items && Array.isArray(req.body.items) && req.body.items.length > 0) {
      for (const item of req.body.items) {
        const productId = item.product || item._id;
        const product = await Product.findById(productId);
        if (product) {
          cartItemsToProcess.push({
            product,
            quantity: item.quantity || 1,
          });
        }
      }
    } else {
      // 2. Otherwise fetch from DB cart
      const cart = await Cart.findOne({
        user: req.user.userId,
      }).populate("items.product");

      if (cart && cart.items.length > 0) {
        cartItemsToProcess = cart.items
          .filter((i) => i.product)
          .map((i) => ({ product: i.product, quantity: i.quantity }));
      }
    }

    if (cartItemsToProcess.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cartItemsToProcess) {
      const productId = item.product._id || item.product;
      const quantity = item.quantity;

      // ATOMIC CONCURRENCY CHECK: Increment reservedStock ONLY if (stock - reservedStock) >= quantity
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: productId,
          $expr: {
            $gte: [
              { $subtract: ["$stock", { $ifNull: ["$reservedStock", 0] }] },
              quantity,
            ],
          },
        },
        {
          $inc: { reservedStock: quantity },
        },
        { returnDocument: "after" }
      );

      if (!updatedProduct) {
        // Rollback any stock reserved in earlier items of this checkout
        for (const reserved of orderItems) {
          await Product.findByIdAndUpdate(reserved.product, {
            $inc: { reservedStock: -reserved.quantity },
          });
        }

        const existingProduct = await Product.findById(productId);
        const available = existingProduct
          ? existingProduct.stock - (existingProduct.reservedStock || 0)
          : 0;

        return res.status(400).json({
          message: existingProduct
            ? `Not enough available stock for ${existingProduct.name}`
            : "Product not found",
          availableStock: available,
          requestedQuantity: quantity,
        });
      }

      // Security: Always use price straight from the database!
      const subtotal = updatedProduct.price * quantity;
      totalAmount += subtotal;

      orderItems.push({
        product: updatedProduct._id,
        name: updatedProduct.name,
        price: updatedProduct.price,
        quantity: quantity,
        subtotal,
      });
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const order = await Order.create({
      user: req.user.userId,
      items: orderItems,
      totalAmount,
      status: "pending",
      expiresAt,
    });

    // Clear DB cart if it exists
    await Cart.findOneAndDelete({ user: req.user.userId });

    res.status(201).json({
      message: "Checkout successful and stock reserved",
      order,
    });
  } catch (error) {
    console.error("Checkout failed error:", error);
    res.status(500).json({
      message: "Checkout failed",
      error: error.message,
    });
  }
};

// Get all orders for the logged-in user
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.userId,
    })
      .sort({ createdAt: -1 })
      .populate("items.product", "name price");

    res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Get all orders (admin only)
const getAllOrders = async (req, res) => {
  try {
    if (String(req.user.role).toUpperCase() !== "ADMIN") {
      return res.status(403).json({
        message: "Access denied. Admin only.",
      });
    }

    const { status } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("items.product", "name price");

    res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Get single order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name price");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Users can only view their own orders, admins can view any
    if (
      order.user._id.toString() !== req.user.userId &&
      String(req.user.role).toUpperCase() !== "ADMIN"
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    if (String(req.user.role).toUpperCase() !== "ADMIN") {
      return res.status(403).json({
        message: "Access denied. Admin only.",
      });
    }

    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Validate the status transition
    const allowedTransitions = VALID_TRANSITIONS[order.status];

    if (!allowedTransitions || !allowedTransitions.includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from '${order.status}' to '${status}'`,
        allowedTransitions,
      });
    }

    // Handle stock changes based on transition
    if (status === "confirmed") {
      // Deduct actual stock and release reservation
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: {
            stock: -item.quantity,
            reservedStock: -item.quantity,
          },
        });
      }
    }

    if (status === "cancelled") {
      // If cancelling a pending order, release reserved stock
      if (order.status === "pending") {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { reservedStock: -item.quantity },
          });
        }
      }

      // If cancelling a confirmed order, restore actual stock
      if (order.status === "confirmed") {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          });
        }
      }
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      message: `Order status updated to '${status}'`,
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

// Cancel order (by the user who placed it)
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({
        message: `Cannot cancel order with status '${order.status}'`,
      });
    }

    // Release stock based on current status
    if (order.status === "pending") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { reservedStock: -item.quantity },
        });
      }
    }

    if (order.status === "confirmed") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    order.status = "cancelled";
    await order.save();

    res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};

// Refund order (Admin or Order owner for paid orders)
const refundOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (
      order.user.toString() !== req.user.userId &&
      String(req.user.role).toUpperCase() !== "ADMIN"
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    if (!["completed", "confirmed"].includes(order.status)) {
      return res.status(400).json({
        message: `Cannot refund order with status '${order.status}'. Only paid/completed orders can be refunded.`,
      });
    }

    // Restore physical stock
    for (const item of order.items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    order.status = "refunded";
    await order.save();

    // Also update payment record if exists
    await Payment.findOneAndUpdate(
      { order: order._id },
      { status: "refunded" }
    );

    res.status(200).json({
      message: "Order refunded successfully and stock restored",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to refund order",
      error: error.message,
    });
  }
};

module.exports = {
  checkout,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  refundOrder,
};