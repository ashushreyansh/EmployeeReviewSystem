const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const User = require("../model/userModel");
const bcrypt = require("bcrypt");

passport.use(
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user || !(await user.verifyPassword(password))) {
          return done(null, false, { message: "Invalid email or password" });
        }
        // Authentication successful, pass the user object to the next middleware
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .exec()
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});

// passport.checkAuthentication = function (req, res, next) {
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   return res.redirect("/");
// };

module.exports = passport;
