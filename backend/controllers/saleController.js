const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Inventory = require("../models/Inventory");
const StockMovement = require("../models/StockMovement");

// Create a new sale and update inventory & stock movements accordingly.
exports.createSale = async (req, res) => {
  try {
    const {
      clientName,
      product: productId, // Expecting product ID selected from the frontend.
      quantity,
      dateOfPurchase,
      warranty,
      termPayable,
      modeOfPayment,
      status,
    } = req.body;

    // Validate required fields
    if (!clientName || !productId || !quantity || !dateOfPurchase || !warranty || !termPayable || !modeOfPayment || !status) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Fetch the product details.
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Calculate total amount: product price * quantity
    const totalAmount = product.price * quantity;

    // Find the corresponding inventory record using productId.
    const inventory = await Inventory.findOne({ productId: product._id });
    if (!inventory) {
      return res.status(404).json({ error: "Inventory record not found for the product" });
    }

    // Check if there is enough stock.
    if (inventory.stockLevel < quantity) {
      return res.status(400).json({ error: "Insufficient stock for the sale" });
    }

    // Create the Sale record.
    const newSale = new Sale({
      clientName,
      product: product._id,
      quantity,
      totalAmount,
      dateOfPurchase,
      warranty,
      termPayable,
      modeOfPayment,
      status,
    });

    // Deduct the quantity from the inventory.
    inventory.stockLevel -= quantity;
    await inventory.save();

    // Create a Stock Movement record for the decrease.
    const stockMovement = new StockMovement({
      inventoryId: inventory._id,
      type: "DECREASE",
      quantity,
      serialNumbers: [], // For products that require serial numbers, you could pass an array here.
      reason: "Sale deduction",
      timestamp: new Date(),
    });
    await stockMovement.save();

    // Save the sale record.
    await newSale.save();

    res.status(201).json({
      message: "Sale created successfully and inventory updated",
      sale: newSale,
      newStockLevel: inventory.stockLevel,
    });
  } catch (error) {
    console.error("Error creating sale:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all sales
exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.find().populate("product", "productName sku category price");
    res.json({ data: sales });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single sale by ID
exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate("product", "productName sku category price");
    if (!sale) return res.status(404).json({ error: "Sale not found" });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a sale (Note: Adjusting a sale after creation may require inventory adjustments)
exports.updateSale = async (req, res) => {
  try {
    const saleId = req.params.id;
    const {
      clientName,
      product: productId,
      quantity,
      dateOfPurchase,
      warranty,
      termPayable,
      modeOfPayment,
      status,
    } = req.body;

    // Find existing sale
    const sale = await Sale.findById(saleId);
    if (!sale) return res.status(404).json({ error: "Sale not found" });

    // Optional: Handle inventory reconciliation if the quantity or product changes.
    // For simplicity, we'll assume no inventory adjustment is done on update.
    // In a real-world scenario, you'd need to reverse the previous sale's effect on inventory and apply the new change.

    const updatedSale = await Sale.findByIdAndUpdate(
      saleId,
      {
        clientName,
        product: productId,
        quantity,
        dateOfPurchase,
        warranty,
        termPayable,
        modeOfPayment,
        status,
      },
      { new: true }
    );

    res.json({ message: "Sale updated successfully", sale: updatedSale });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a sale (Optionally, you might consider reversing the stock deduction)
exports.deleteSale = async (req, res) => {
  try {
    const saleId = req.params.id;
    const sale = await Sale.findById(saleId);
    if (!sale) return res.status(404).json({ error: "Sale not found" });

    // OPTIONAL: Reverse the sale's effect on inventory.
    const product = await Product.findById(sale.product);
    const inventory = await Inventory.findOne({ productId: product._id });
    if (inventory) {
      inventory.stockLevel += sale.quantity;
      await inventory.save();

      // Record the reversal in stock movements.
      const stockMovement = new StockMovement({
        inventoryId: inventory._id,
        type: "INCREASE",
        quantity: sale.quantity,
        serialNumbers: [], // Adjust if handling serial numbers.
        reason: "Sale deletion - stock restored",
        timestamp: new Date(),
      });
      await stockMovement.save();
    }

    await Sale.findByIdAndDelete(saleId);

    res.json({ message: "Sale deleted and inventory updated accordingly" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
