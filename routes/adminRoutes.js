// adminRoutes.js
const express = require("express");
const adminRouter = express.Router();
const User = require("../model/userModel");
const PerformanceReview = require("../model/performanceReviewModel");

// Middleware for checking authentication
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  // res.json({ authenticated: false });
  res.redirect("/login");
};

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return next();
  }
  res.redirect("/login");
};

// Function to generate a random password
const generateRandomPassword = (length = 12) => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
};

// Admin panel route
adminRouter.get("/admin", isAuthenticated, isAdmin, (req, res) => {
  res.render("adminPage", { authenticated: true, user: req.user });
});

// Admin employees route
adminRouter.get(
  "/admin/employees",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      // Fetch all users from the database
      const employees = await User.find({});
      console.log(employees);
      res.render("employeePage", {
        authenticated: true,
        user: req.user,
        employees,
        errorMessage: "",
      });
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

adminRouter.post(
  "/admin/add-employee",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const { employeeName, employeeEmail, employeeRole } = req.body;

      // Check if an employee with the provided email already exists
      const existingEmployee = await User.findOne({ email: employeeEmail });

      if (existingEmployee) {
        req.flash(
          "errorMessage",
          "Employee with this email already exists. Please use a different email."
        );
        return res.redirect("/admin/employees");
      }
      const randomPassword = generateRandomPassword();
      // Create a new employee in the database
      const newEmployee = new User({
        username: employeeName,
        email: employeeEmail,
        password: randomPassword, // You might want to handle password better
        role: employeeRole,
      });

      await newEmployee.save();

      // Redirect to the employee page after successful employee creation
      res.redirect("/admin/employees");
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

adminRouter.post(
  "/admin/remove-employee/:id",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    console.log("reached delete route");
    try {
      const employeeId = req.params.id;
      // Check if the employeeId is valid
      if (!employeeId) {
        return res.status(400).json({ message: "Invalid employee ID" });
      }

      // Remove the employee from the database
      const result = await User.findByIdAndDelete(employeeId);
      // Check if the employee was found and removed successfully
      if (!result) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing employee:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

adminRouter.get(
  "/admin/update-employee/:id",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const employeeId = req.params.id;
      const employee = await User.findById(employeeId);

      if (!employee) {
        return res.status(404).send("Employee not found");
      }

      // Render the update employee page with the employee data
      res.render("updateEmployeePage", {
        authenticated: true,
        user: req.user,
        employee: employee,
      });
    } catch (error) {
      console.error("Error rendering update employee page:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Route to handle the update of employee information
adminRouter.post(
  "/admin/update-employee/:id",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    const employeeId = req.params.id;
    const { updatedEmployeeName, updatedEmployeeEmail, updatedEmployeeRole } =
      req.body;

    try {
      // Find the employee by ID
      const employee = await User.findById(employeeId);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Update the employee properties
      employee.username = updatedEmployeeName;
      employee.email = updatedEmployeeEmail;
      employee.role = updatedEmployeeRole;

      // Save the updated employee to the database
      await employee.save();

      // Redirect to the employee page or wherever needed
      res.redirect("/admin/employees");
    } catch (error) {
      console.error("Error updating employee:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Admin performance reviews route
adminRouter.get(
  "/admin/performance-reviews",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      // Fetch all performance reviews
      const performanceReviews = await PerformanceReview.find({}).populate(
        "employee reviewer"
      );

      res.render("adminPerformanceReviews", {
        authenticated: true,
        user: req.user,
        performanceReviews,
      });
    } catch (error) {
      console.error("Error fetching performance reviews:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Route to render the performance review form page
adminRouter.get(
  "/admin/add-performance-review-form",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      // Fetch any data needed for the form (e.g., employees and reviewers)
      const employeesAndReviewers = await User.find({});

      res.render("addPerformanceReviewForm", {
        authenticated: true,
        user: req.user,
        employeesAndReviewers,
      });
    } catch (error) {
      console.error("Error fetching data for the form:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

adminRouter.post(
  "/admin/add-performance-review-form",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const { employeeId, reviewerId, status } = req.body;

      // Create a new performance review in the database
      const performanceReview = new PerformanceReview({
        employee: employeeId,
        reviewer: reviewerId,
        status: status,
      });

      await performanceReview.save();

      res.redirect("/admin/performance-reviews"); // Redirect to the performance reviews page
    } catch (error) {
      console.error("Error adding performance review:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// // Add, update, or view a performance review (example route, modify as needed)
// adminRouter.get(
//   "/admin/performance-review/:id",
//   isAuthenticated,
//   isAdmin,
//   async (req, res) => {
//     try {
//       const performanceReviewId = req.params.id;
//       const performanceReview = await PerformanceReview.findById(
//         performanceReviewId
//       ).populate("employee reviewer");

//       // Render a page to view or edit the performance review
//       res.render("performanceReviewPage", {
//         authenticated: true,
//         user: req.user,
//         performanceReview,
//       });
//     } catch (error) {
//       console.error("Error fetching performance review:", error);
//       res.status(500).send("Internal Server Error");
//     }
//   }
// );

adminRouter.get(
  "/admin/update-performance-review/:id",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const performanceReviewId = req.params.id;
      const performanceReview = await PerformanceReview.findById(
        performanceReviewId
      ).populate("employee reviewer");

      res.render("updatePerformanceReviewForm", {
        authenticated: true,
        user: req.user,
        performanceReview,
      });
    } catch (error) {
      console.error("Error fetching performance review for update:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);
adminRouter.post(
  "/admin/update-performance-review/:id",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const performanceReviewId = req.params.id;
      const { employeeId, reviewerId, feedback, status } = req.body;

      // Validate the input (add additional validation as needed)

      // Find the performance review in the database
      const performanceReview = await PerformanceReview.findById(
        performanceReviewId
      );

      if (!performanceReview) {
        return res
          .status(404)
          .json({ message: "Performance review not found" });
      }

      // Update the performance review properties
      performanceReview.employee = employeeId;
      performanceReview.reviewer = reviewerId;
      performanceReview.feedback = feedback;
      performanceReview.status = status;

      // Save the updated performance review to the database
      await performanceReview.save();

      res.redirect("/admin/performance-reviews"); // Redirect to the performance reviews page or wherever needed
    } catch (error) {
      console.error("Error updating performance review:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Assign employees to participate in another employee's performance review
adminRouter.post(
  "/admin/assign-reviewers/:employeeId",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const { reviewerIds } = req.body;
      const employeeId = req.params.employeeId;

      // Find the employee and reviewers in the database
      const employee = await User.findById(employeeId);
      const reviewers = await User.find({ _id: { $in: reviewerIds } });

      // Create a new performance review and associate it with the employee and reviewers
      const performanceReview = new PerformanceReview({
        employee: employee._id,
        reviewer: reviewerIds,
      });

      await performanceReview.save();

      // Update the employee's performanceReviews field with the new review
      employee.performanceReviews.push(performanceReview._id);
      await employee.save();

      res.redirect("/admin/employees"); // Redirect to the employee page or wherever needed
    } catch (error) {
      console.error("Error assigning reviewers:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = adminRouter;
