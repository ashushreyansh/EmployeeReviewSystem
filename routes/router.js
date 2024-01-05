const express = require("express");
const Router = express.Router();
const userController = require("../controller/userController");
const session = require("express-session");
const passport = require("../config/passportStrategy");
const flash = require("connect-flash");
const FileStore = require("session-file-store")(session);
const adminRoutes = require("./adminRoutes");
const employeeRoutes = require("./employeeRoutes");

Router.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
Router.use(passport.initialize());
Router.use(passport.session());
Router.use(flash());

Router.use((req, res, next) => {
  res.locals.errorMessage = req.flash("errorMessage");
  next();
});
// Middleware for checking authentication
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  // res.json({ authenticated: false });
  res.redirect("/login");
};

Router.get("/", (req, res) => {
  // Check if the user is authenticated
  if (req.isAuthenticated()) {
    // Check user role and redirect accordingly
    if (req.user.role === "admin") {
      return res.redirect("/admin");
    } else if (req.user.role === "employee") {
      return res.redirect("/employee");
    } else {
      // Redirect to login if the role is neither admin nor employee
      return res.redirect("/login");
    }
  } else {
    // If not authenticated, redirect to login
    return res.redirect("/login");
  }
});

Router.use("/", adminRoutes);

Router.use("/", employeeRoutes);

Router.get("/login", (req, res) => {
  res.render("loginPage", {
    message: req.flash("error"),
    authenticated: req.isAuthenticated(),
  });
});

Router.get("/signup", (req, res) => {
  res.render("signupPage", { errorMessage: "" });
});

Router.post("/signup", userController.Signup);

Router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

Router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

module.exports = Router;
