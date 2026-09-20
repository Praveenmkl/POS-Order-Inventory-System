const Payment = require("../models/Payment");
const Order = require("../models/Order");
const Product = require("../models/Product");

const makePayment = async (req, res) => {
  try {
    const { orderId, paymentStatus } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        message: "Payment is not available for this order",
      });
    }

    if (!["success", "failed"].includes(paymentStatus)) {
      return res.status(400).json({
        message: "Invalid payment status",
      });
    }

    const existingPayment = await Payment.findOne({
      order: order._id,
    });

    if (existingPayment) {
      return res.status(400).json({
        message: "Payment already processed",
      });
    }

    const transactionId =
      "TXN-" +
      Date.now() +
      "-" +
      Math.floor(Math.random() * 10000);

    const payment = await Payment.create({
      order: order._id,
      user: req.user.userId,
      amount: order.totalAmount,
      status: paymentStatus,
      paymentMethod: "mock_card",
      transactionId,
    });

    if (paymentStatus === "success") {
      // Deduct reserved stock and reduce actual stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: {
            stock: -item.quantity,
            reservedStock: -item.quantity,
          },
        });
      }

      order.status = "completed";
      await order.save();

      return res.status(200).json({
        message: "Payment successful",
        payment,
        order,
      });
    }

    if (paymentStatus === "failed") {
      // Release reserved stock back to available
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { reservedStock: -item.quantity },
        });
      }

      order.status = "cancelled";
      await order.save();

      return res.status(200).json({
        message: "Payment failed",
        payment,
        order,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Payment processing failed",
      error: error.message,
    });
  }
};

module.exports = {
  makePayment,
};