const express = require("express");
const router = express.Router();

const multer = require('multer')
const { storage } = require("../cloudconfig.js")
const upload = multer({ storage })

//Schemas
const Listing = require("../models/Listing");
//error Handling
const WrapAsync = require("../utils/WrapAsync");
const ExpressError = require("../utils/ExpressError");
//Jio

const { isLoggedIn, isOwner, validatelisting } = require("../middleware");
const listingController = require("../controllers/listing");

router
  .route("/")
  .get(WrapAsync(listingController.index)) //index route
  .post(
    //add lsiting:update
    isLoggedIn,
    upload.single('listing[image]'),
    validatelisting,
    WrapAsync(listingController.addNewlisting),
  );
// .post( upload.single('listing[image]'), (req,res)=>{
//   res.send(req.file);
// })

//new route
router.get("/new", isLoggedIn, (req, res) => {
  res.render("Listings/new.ejs");
});

router
  .route("/:id")
  .get(WrapAsync(listingController.renderShowListing)) //Read : show route
  .put(
    //Update Route
    isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
    validatelisting,
    WrapAsync(listingController.updateListing),
  )
  .delete(isLoggedIn, isOwner, WrapAsync(listingController.destroyListing)); //delete route

//edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  WrapAsync(listingController.renderEditForm),
);


module.exports = router;
