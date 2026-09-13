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
      // Atomically transition status from pending to cancelled to avoid race conditions with payment
      const cancelledOrder = await Order.findOneAndUpdate(
        { _id: order._id, status: "pending" },
        { status: "cancelled" },
        { returnDocument: "after" }
      );

      if (cancelledOrder) {
        // Release reserved stock atomically
        for (const item of order.items) {
          if (item.product) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { reservedStock: -item.quantity },
            });

            // Prevent negative reserved stock
            await Product.updateOne(
              { _id: item.product, reservedStock: { $lt: 0 } },
              { $set: { reservedStock: 0 } }
            );
          }
        }
        console.log(`Order ${order._id} expired, cancelled, and stock released`);
      }
    }
  } catch (error) {
    console.error("Failed to process expired orders:", error.message);
  }
};

module.exports = releaseExpiredOrders;