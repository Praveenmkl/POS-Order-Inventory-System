const express = require("express");

const router = express.Router();

const {
    createProduct,
    getProducts,
    getProductById, 
    updateProduct, 
    deleteProduct
} = require("../controlllers/productController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");


router.post("/", protect, authorizeRoles("admin"), createProduct);
router.get("/", protect, getProducts);
router.get("/:id", protect, getProductById);
router.put("/:id", protect, authorizeRoles("admin"), updateProduct);
router.delete("/:id", protect, authorizeRoles("admin"), deleteProduct);

module.exports = router;