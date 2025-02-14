const Product = require("../models/Product");
const Inventory = require("../models/Inventory");

// Create Product & Automatically Add to Inventory
exports.createProduct = async (req, res) => {
  try {
    const { productName, sku, category, price, requiresSerialNumber } =
      req.body;

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(400).json({ error: "SKU already exists" });
    }

    // Create Product Entry
    const newProduct = new Product({
      productName,
      sku,
      category,
      price,
      requiresSerialNumber,
    });
    await newProduct.save();

    // Create Inventory Entry with stockLevel: 0
    const newInventory = new Inventory({
      productName,
      sku,
      category,
      stockLevel: 0, // Default stock
    });
    await newInventory.save();

    res
      .status(201)
      .json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ data: products.length ? products : [] });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Fetch a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid Product ID format" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Update Product and Inventory
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { productName, sku, category, price, active, requiresSerialNumber } =
      req.body;

    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid Product ID format" });
    }

    const existingProduct = await Product.findById(productId);
    if (!existingProduct)
      return res.status(404).json({ error: "Product not found" });

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { productName, sku, category, price, active, requiresSerialNumber },
      { new: true }
    );

    // Update inventory if SKU or Category changes
    if (existingProduct.sku !== sku || existingProduct.category !== category) {
      await Inventory.updateMany({ productId }, { $set: { sku, category } });
    }

    // Update inventory active status
    await Inventory.updateMany({ productId }, { $set: { active: active } });

    res.json({
      message: "Product and inventory updated successfully!",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Manually trigger inventory update
exports.updateInventoryForProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) return res.status(404).json({ error: "Product not found" });

    const updatedInventory = await Inventory.updateMany(
      { productId },
      {
        $set: {
          sku: product.sku,
          category: product.category,
          active: product.active,
        },
      }
    );

    res.json({ message: "Inventory updated after product update!" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Delete Product & Remove from Inventory
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Remove product and associated inventory
    await Product.findByIdAndDelete(req.params.id);
    await Inventory.findOneAndDelete({ sku: product.sku });

    res.json({ message: "Product and linked inventory deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
