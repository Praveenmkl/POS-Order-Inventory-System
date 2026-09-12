const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");

// Valid status transitions
const VALID_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["completed"],
  completed: [],
  cancelled: [],
};

const checkout = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const cart = await Cart.findOne({
      user: req.user.userId,
    })
      .populate("items.product")
      .session(session);

    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await Product.findOneAndUpdate(
        {
          _id: item.product._id,
          $expr: {
            $gte: [
              { $subtract: ["$stock", "$reservedStock"] },
              item.quantity,
            ],
          },
        },
        {
          $inc: { reservedStock: item.quantity },
        },
        {
          new: true,
          session,
        }
      );

      if (!product) {
        await session.abortTransaction();

        const existingProduct = await Product.findById(
          item.product._id
        );

        if (!existingProduct) {
          return res.status(404).json({
            message: `Product not found: ${item.product.name}`,
          });
        }

        const availableStock =
          existingProduct.stock - existingProduct.reservedStock;

        return res.status(400).json({
          message: `Not enough available stock for ${existingProduct.name}`,
          availableStock,
          requestedQuantity: item.quantity,
        });
      }

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal,
      });
    }

    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    const [order] = await Order.create(
      [
        {
          user: req.user.userId,
          items: orderItems,
          totalAmount,
          status: "pending",
          expiresAt,
        },
      ],
      { session }
    );
    
    await Cart.findOneAndDelete(
      { user: req.user.userId },
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      message: "Checkout successful and stock reserved",
      order,
    });
  } catch (error) {
    await session.abortTransaction();

    res.status(500).json({
      message: "Checkout failed",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// Get all orders for the logged-in user
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.userId,
    })
      .sort({ createdAt: -1 })
      .populate("items.product", "name price image");

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
    if (req.user.role !== "admin") {
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
      .populate("items.product", "name price image");

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
      .populate("items.product", "name price image");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Users can only view their own orders, admins can view any
    if (
      order.user._id.toString() !== req.user.userId &&
      req.user.role !== "admin"
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
    if (req.user.role !== "admin") {
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

module.exports = {
  checkout,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};