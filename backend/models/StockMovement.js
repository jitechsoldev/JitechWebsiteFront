const mongoose = require("mongoose");

const StockMovementSchema = new mongoose.Schema(
  {
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    type: { type: String, enum: ["INCREASE", "DECREASE"], required: true },
    quantity: { type: Number, required: true },
    reason: { type: String },
    serialNumbers: [{ type: String }], // ✅ Store serial numbers as an array
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockMovement", StockMovementSchema);
