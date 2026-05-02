const express = require("express");
const router = express.Router();
const User = require("../models/user");
const WrapAsync = require("../utils/WrapAsync");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware");

const userController = require("../controllers/user");

router
  .route("/signup")
  .get(userController.signupLoader) // signup loader
  .post(
    //signup api
    WrapAsync(userController.signup),
  );

router.route("/login")
.get(userController.renderLogin) //login page loader
.post(                           //login api
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.login,
);


router.get("/logout", userController.logout);

module.exports = router;
