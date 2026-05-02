//Schemas
const Listing = require("../models/Listing");
const Review = require("../models/reviews")

module.exports.addReview=async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author=req.user._id;
    console.log(newReview)

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success","Review Added Successfully");

    // console.log("Reviews are saved ")
    // res.send("Reviews are saved ")
    res.redirect(`/listing/${listing.id}`)
}

module.exports.destroyReview=async (req, res) => {
    let { id, reviewID } = req.params;

    // $pull is a MongoDB operator used to remove specific items from an array.
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewID } });;
    await Review.findByIdAndDelete(reviewID);

    req.flash("success","Review Deleted Successfully");
    res.redirect(`/listing/${id}`)
}

