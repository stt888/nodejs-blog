const express = require("express");
let router = express.Router();
const User = require("../model/user");
const { check, validationResult } = require("express-validator/check");
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const bcrypt = require("bcryptjs");
const passport = require("passport");

// route for register page
router.get("/register", function(req, res) {
  User.find({}, function(err, users) {
    res.render("users/register");
  });
});

// route for making registration page
router.post(
  "/register",
  urlencodedParser,
  [
    check("name")
      .isLength({ min: 1 })
      .withMessage("Name is required."),
    check("username")
      .isLength({ min: 1 })
      .withMessage("User name is required."),
    check("email")
      .isLength({ min: 1 })
      .withMessage("Email is required."),
    check("email")
      .isEmail()
      .withMessage("Invalid email."),
    check("password", "invalid password")
      .isLength({ min: 1 })
      .custom((value, { req, loc, path }) => {
        if (value !== req.body.password_confirmation) {
          throw new Error("Passwords don't match");
        } else {
          return value;
        }
      })
  ],
  function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("users/register", {
        errors: errors.array(),
        title: "Register user."
      });
    } else {
      let user = new User(req.body);
      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(user.password, salt, function(err, hash) {
          if (err) {
            console.log(err);
            return;
          }
          user.password = hash;

          user.save(function(err) {
            if (err) {
              console.log(err);
              return;
            } else {
              req.flash("success", "You'er registered.");
              res.redirect("/users/login");
            }
          });
        });
      });
    }
  }
);

// route for login page
router.get("/login", function(req, res) {
  User.find({}, function(err, users) {
    res.render("users/login");
  });
});

// route for making login page
router.post("/login", function(req, res, next) {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true,
    successFlash: "Welcome!"
  })(req, res, next);
});

// route for making logout page
router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "You are logged out.");
  res.redirect("/users/login");
});


module.exports = router;
