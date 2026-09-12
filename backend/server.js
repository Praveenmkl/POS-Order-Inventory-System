const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./src/config/database");
const productRoutes = require("./src/routes/productRoutes");
const authRoutes = require('./src/routes/authRoutes');
const cartRoutes = require("./src/routes/cartRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const paymentRoutes = require("./src/routes/paymemtRoutes");
const releaseExpiredOrders = require("./src/services/orderExpiryService");

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "POS Inventory Management API is running",
  });
});


app.use('/api/auth', authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  setInterval(async () => {
    await releaseExpiredOrders();
  }, 60 * 1000); // 1 minute
});