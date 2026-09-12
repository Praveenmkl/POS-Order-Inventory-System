const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");

const checkout = async (req, res) => {
  // Start a MongoDB session for transaction
  const session = await mongoose.startSession();

  try {
    
    session.startTransaction();

    //get user's cart
    const cart = await Cart.findOne({
      user: req.user.userId,
    })
      .populate("items.product")
      .session(session);

    //check cart
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

      //prepare order item
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal,
      });
    }

    // Create the order within the transaction
    const [order] = await Order.create(
      [
        {
          user: req.user.userId,
          items: orderItems,
          totalAmount,
          status: "pending",
        },
      ],
      { session }
    );

    // Clear the cart within the transaction
    await Cart.findOneAndDelete(
      { user: req.user.userId },
      { session }
    );

    // Commit transaction — all changes are now permanent
    await session.commitTransaction();

    res.status(201).json({
      message: "Checkout successful and stock reserved",
      order,
    });
  } catch (error) {
    // If anything fails, abort the transaction to roll back all changes
    await session.abortTransaction();

    res.status(500).json({
      message: "Checkout failed",
      error: error.message,
    });
  } finally {
    // Always end the session to free resources
    session.endSession();
  }
};

module.exports = {
  checkout,
};