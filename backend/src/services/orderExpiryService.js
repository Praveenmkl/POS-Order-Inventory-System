const Order = require("../models/Order");
const Product = require("../models/Product");

const releaseExpiredOrders = async () => {
  try {
    const expiredOrders = await Order.find({
      status: "pending",
      expiresAt: {
        $lte: new Date(),
      },
    });

    for (const order of expiredOrders) {
      // Release reserved stock
      for (const item of order.items) {
        const product = await Product.findById(
          item.product
        );

        if (!product) {
          continue;
        }

        product.reservedStock -= item.quantity;

        // Prevent negative reserved stock
        if (product.reservedStock < 0) {
          product.reservedStock = 0;
        }

        await product.save();
      }

      // Cancel order
      order.status = "cancelled";

      await order.save();

      console.log(
        `Order ${order._id} expired and cancelled`
      );
    }
  } catch (error) {
    console.error(
      "Failed to process expired orders:",
      error.message
    );
  }
};

module.exports = releaseExpiredOrders;