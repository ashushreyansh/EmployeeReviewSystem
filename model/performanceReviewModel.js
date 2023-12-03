const mongoose = require("mongoose");

const performanceReviewSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  feedback: { type: String },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },
});

const PerformanceReview = mongoose.model(
  "PerformanceReview",
  performanceReviewSchema
);

module.exports = PerformanceReview;
