const Listing = require("./models/Listing");
const Review = require("./models/reviews");
const ExpressError = require("./utils/ExpressError");

//Jio- Schema Validation
const { ListingSchema,ReviewsSchema } = require("./schema");

module.exports.isLoggedIn = (req, res, next) => {
  // console.log(req.path,"..",req.originalUrl);
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to create listing!!");
    return res.redirect("/login")
  }
  next(); // u may proceed
}

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
}

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let updatelst = await Listing.findById(id);
  if (!updatelst.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not permitted to make changes");
    return res.redirect(`/listing/${id}`)
  }
  next();
}

//validating listing
module.exports.validatelisting = (req, res, next) => {
  // extracts tha error obj that cause failure in schema validation
  let { error } = ListingSchema.validate(req.body);

  // if there any error 
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// validating reviews
module.exports.validatereviews = (req, res, next) => {
    let { error } = ReviewsSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
  let { id,reviewID } = req.params;
  let newReview= await Review.findById(reviewID);
  if (!newReview.author._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not author of this review");
    return res.redirect(`/listing/${id}`)
  }
  next();
}