const bcrypt = require("bcrypt");
const User = require("../model/userModel");

// Signup route
exports.Signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if a user with the provided email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.render("signupPage", {
        errorMessage: "Email is already in use. Please try a different email.",
      });
    }
    const role = "employee";
    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role,
    });

    await newUser.save();
    res.redirect("/");
    // res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.render("signupPage", { errorMessage: "Internal server error" });
    // res.status(500).json({ message: "Internal server error" });
  }
};

// Login route
exports.Login = async (req, res) => {
  console.log("controller login function reached");
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      res.status(401).json({ error: "No such account was found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      console.log(user);

      // Check user role and redirect accordingly
      if (user.role === "admin") {
        res.redirect("/admin"); // Redirect to the admin page
      } else if (user.role === "employee") {
        res.redirect("/employee"); // Redirect to the employee page
      } else {
        // Default redirect if no specific role is matched
        res.redirect("/");
      }
    } else {
      res.status(401).json({ error: "Incorrect password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
