const StockMovement = require("../models/StockMovement");
const Inventory = require("../models/Inventory");

// Add stock movement (increase/decrease stock)
exports.addStockMovement = async (req, res) => {
  try {
    const { inventoryId, type, quantity, reason } = req.body;

    // Ensure inventory exists before adding stock movement
    const inventoryItem = await Inventory.findById(inventoryId);
    if (!inventoryItem) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    // Create stock movement record
    const stockMovement = new StockMovement({
      inventoryId,
      type,
      quantity,
      reason,
      timestamp: new Date(),
    });

    await stockMovement.save();

    // Update inventory stock level automatically
    if (type === "INCREASE") {
      inventoryItem.stockLevel += quantity;
    } else if (type === "DECREASE") {
      inventoryItem.stockLevel -= quantity;
    }

    await inventoryItem.save();

    res.json({
      message: "Stock successfully updated!",
      stockMovement,
      newStockLevel: inventoryItem.stockLevel,
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get stock movements for an inventory item
exports.getStockMovements = async (req, res) => {
  try {
    const stockMovements = await StockMovement.find().populate(
      "inventoryId",
      "productName"
    );

    res.json({ data: stockMovements.length ? stockMovements : [] });
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    res.status(500).json({ error: "Server error" });
  }
};
