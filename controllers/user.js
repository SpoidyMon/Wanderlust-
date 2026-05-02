
const User=require("../models/user")

module.exports.signupLoader= (req, res) => {
  res.render("users/signup.ejs");
}

module.exports.signup=async (req, res) => {
    try {
      let { username, email, password } = req.body;
      const newUser = new User({ email, username });
      const registeredUser = await User.register(newUser, password);
      // console.log(registeredUser);

      // Passport's login method automatically establishes a login session.
      // We can invoke login to automatically login a user.
      req.login(registeredUser, (err) => {
        if (err) {
          next(err);
        }
        req.flash("success", "Welcome to Wonderlust");
        res.redirect("/listing");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
}

module.exports.renderLogin=(req, res) => {
  res.render("users/login.ejs");
}

module.exports.login=async (req, res) => {
    req.flash("success", "Welcome back to Wonderlust");
    let redirectUrl= res.locals.redirectUrl || "/listing";
    res.redirect(redirectUrl);
}

module.exports.logout= (req, res) => {
  req.logOut((err) => {
    if (err) {
      //passes error hanlding to global error middleware
      return next(err);
    }
    req.flash("success", "You have logged out!!");
    res.redirect("/listing");
  });
}