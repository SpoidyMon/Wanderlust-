const express=require("express");
const router=express.Router({mergeParams:true});
// mergeParams: true allows a child router to access parameters (like :id) defined in its parent router.

//error Handling
const WrapAsync = require("../utils/WrapAsync")
const ExpressError = require("../utils/ExpressError")
//jio
const { ReviewsSchema } = require("../schema");
const { validatereviews, isLoggedIn, isAuthor }=require("../middleware")

const reviewController=require("../controllers/review")

//----------------------------------------------------
//reviews 
//Adding reviews
router.post("/",isLoggedIn, validatereviews, WrapAsync(reviewController.addReview))

//Deleting Reviews

// deleteing the listing is handled ***middleware in Listing.js****
router.delete("/:reviewID",isLoggedIn,isAuthor,WrapAsync(reviewController.destroyReview));

module.exports=router;