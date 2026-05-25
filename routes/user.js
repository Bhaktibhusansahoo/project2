const express = require("express");
const router = express.Router();

const passport = require("passport");
const User = require("../models/user");

// ================= SIGNUP ROUTE =================
router
  .route("/signup")
  .get((req, res) => {
    res.render("users/signup.ejs");
  })
  .post(async (req, res) => {
    try {
      let { username, email, password } = req.body;

      let newUser = new User({ email, username });

      let registeredUser = await User.register(newUser, password);

      req.login(registeredUser, (err) => {
        if (err) return next(err);

        req.flash("success", "Welcome to Wanderlust!");
        res.redirect("/listings");
      });

    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
  });

// ================= LOGIN ROUTE =================
router
  .route("/login")
  .get((req, res) => {
    res.render("users/login.ejs");
  })
  .post(
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    (req, res) => {
      req.flash("success", "Welcome back!");
      res.redirect("/listings");
    }
  );

// ================= LOGOUT ROUTE =================
router
  .route("/logout")
  .get((req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);

      req.flash("success", "Logged out successfully!");
      res.redirect("/listings");
    });
  });

module.exports = router;