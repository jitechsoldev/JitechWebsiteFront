const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    stockLevel: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", InventorySchema);
