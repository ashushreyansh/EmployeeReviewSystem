// employeeRoutes.js
const express = require("express");
const employeeRouter = express.Router();
const employeeController = require("../controller/employeeController");
const PerformanceReview = require("../model/performanceReviewModel");

// Middleware for checking if the user is an employee
const isEmployee = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "employee") {
    return next();
  }
  res.redirect("/login");
};

// Middleware for checking authentication
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  // res.json({ authenticated: false });
  res.redirect("/login");
};
employeeRouter.get(
  "/employee",
  isAuthenticated,
  isEmployee,
  async (req, res) => {
    try {
      // Fetch performance reviews for the current employee
      const performanceReviews = await employeeController.getPerformanceReviews(
        req.user._id
      );

      // Render the employee dashboard with the performance reviews
      res.render("employeeDashboard", {
        authenticated: true,
        user: req.user,
        performanceReviews: performanceReviews,
      });
    } catch (error) {
      // Handle error
      console.error(error);
      res.redirect("/");
    }
  }
);

employeeRouter.get(
  "/employee/feedback-form/:reviewId",
  isAuthenticated,
  isEmployee,
  async (req, res) => {
    console.log("Reached /feedback-form route");
    try {
      // Retrieve the performance review based on reviewId
      const review = await PerformanceReview.findById(req.params.reviewId)
        .populate("employee", "username") // Populate employee details
        .populate("reviewer", "username"); // Populate reviewer details

      if (!review) {
        return res.status(404).send("Performance review not found");
      }
      console.log(review);
      // Render the feedback form page
      res.render("feedbackForm", {
        authenticated: true,
        user: req.user,
        review: review,
      });
    } catch (error) {
      // Handle error
      console.error(error);
      res.redirect("/employee"); // Redirect to the employee dashboard in case of an error
    }
  }
);
employeeRouter.post(
  "/submit-feedback/:reviewId",
  isAuthenticated,
  isEmployee,
  async (req, res) => {
    const { feedback } = req.body;
    const reviewId = req.params.reviewId;

    try {
      // Find the performance review by ID
      const performanceReview = await PerformanceReview.findById(reviewId);

      if (!performanceReview) {
        return res.status(404).send("Performance review not found");
      }

      // Update the feedback field
      performanceReview.feedback = feedback;
      performanceReview.status = "completed"; // Assuming you want to mark it as completed

      // Save the updated performance review to the database
      await performanceReview.save();

      res.redirect("/employee"); // Redirect to the home page or wherever you want after submission
    } catch (error) {
      console.error("Error updating feedback:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = employeeRouter;
