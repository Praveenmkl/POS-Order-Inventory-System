const Product = require("../models/Product");


//create product 

const createProduct = async (req, res) => {
    try {
        const { name, price, stock, category, description, image } = req.body;
   
        const existingProduct = await Product.findOne({name});
        if(existingProduct){
            return res.status(400).json({
                message: "Product already exists",
            });
        }

        const product = await Product.create({
            name,
            price,
            stock,
            category,
            description,
            image,
        });

        res.status(201).json({
            message: "Product created successfully",
            product,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to create product",
            error: error.message,
        })

    }
};

//read product

const getProducts = async(req,res) => {
    try{
        const products = await Product.find();

        res.status(200).json({
            products,
        });
    }catch(error){
        res.status(500).json({
            message: "Failed to fetch products",
            error: error.message,
        });
    }
};

const getProductById = async(req,res) => {
    try{
        const product = await Product.findById(req.params.id);

        if(!product){
            return res.status(404).json({
                message: "Product not found",
            });
        }

        res.status(200).json({
            product,
        });
    }
    catch(error){
        res.status(500).json({
            message: "Failed to fetch product",
            error : error.message,
        });
    }
}

//update product
const updateProduct = async (req,res) => {
    try{
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if(!product){
            return res.status(404).json({
                message: "Product not found",
            });
        }

        res.status(200).json({
            message: "Product updated successfully",
            product,
        });
    }
    catch(error){
        res.status(500).json({
            message: "Failed to update product",
            error: error.message,
        });
    }
}

//delete product
const deleteProduct = async (req,res) => {
    try{
        const product = await Product.findByIdAndDelete(req.params.id);

        if(!product){
            return res.status(404).json({
                message: "Product not found",
            });
        }

        res.status(200).json({
            message: "Product deleted successfully",
            product,
        });
    }
    catch(error){
        res.status(500).json({
            message: "Failed to delete product",
            error: error.message,
        });
    }
}

module.exports = {createProduct, getProducts, getProductById, updateProduct, deleteProduct};
