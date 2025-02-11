const mongoose = require("mongoose");

const JobOrderSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  contactNo: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" }
}, { timestamps: true });

module.exports = mongoose.model("JobOrder", JobOrderSchema);
