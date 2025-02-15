const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
    },
    // We store the product reference.
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    // Total amount is computed as product price * quantity.
    totalAmount: {
      type: Number,
      required: true,
    },
    dateOfPurchase: {
      type: Date,
      required: true,
    },
    warranty: {
      type: String,
      required: true,
    },
    termPayable: {
      type: String,
      required: true,
    },
    modeOfPayment: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    // The "action" field is typically handled in the UI (Edit/Delete), so it's not stored.
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sale", SaleSchema);
