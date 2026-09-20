const Order = require("../models/Order");
const Product = require("../models/Product");

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [orders, products] = await Promise.all([
      Order.find({ createdAt: { $gte: today } }),
      Product.find()
    ]);

    const totalSales = orders
      .filter(o => o.status === "completed" || o.status === "paid")
      .reduce((sum, o) => sum + o.totalAmount, 0);
      
    const todaysOrders = orders.length;
    const totalProducts = products.length;
    
    const lowStockThreshold = 5; // Should ideally come from Settings
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= lowStockThreshold).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const reservedStock = products.reduce((sum, p) => sum + p.reservedStock, 0);

    res.json({
      totalSales,
      todaysOrders,
      totalProducts,
      lowStock,
      outOfStock,
      reservedStock
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard stats", error: error.message });
  }
};
