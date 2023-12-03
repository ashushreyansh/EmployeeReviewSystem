// employeeController.js
const PerformanceReview = require("../model/performanceReviewModel");

const employeeController = {
  getPerformanceReviews: async (employeeId) => {
    try {
      // Fetch performance reviews where the employee is the reviewer
      const reviewsToComplete = await PerformanceReview.find({
        reviewer: employeeId,
        status: "pending",
      })
        .populate("employee", "username") // Populate employee details
        .populate("reviewer", "username"); // Populate reviewer details

      return reviewsToComplete;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = employeeController;
