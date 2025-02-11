const express = require("express");
const router = express.Router();
const JobOrder = require("../models/JobOrder");

// Create Job Order
router.post("/job-orders", async (req, res) => {
  try {
    const newJob = new JobOrder(req.body);
    await newJob.save();
    res.status(201).json(newJob);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Fetch All Job Orders
router.get("/job-orders", async (req, res) => {
  try {
    const jobs = await JobOrder.find();
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Job Order
router.delete("/job-orders/:id", async (req, res) => {
  try {
    await JobOrder.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
