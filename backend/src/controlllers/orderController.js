const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");

const checkout = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user.userId,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);

      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.product.name}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}`,
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

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);

      product.stock -= item.quantity;

      await product.save();
    }

    const order = await Order.create({
      user: req.user.userId,
      items: orderItems,
      totalAmount,
      status: "pending",
    });

    await Cart.findOneAndDelete({
      user: req.user.userId,
    });

    res.status(201).json({
      message: "Checkout successful",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Checkout failed",
      error: error.message,
    });
  }
};

module.exports = {
  checkout,
};