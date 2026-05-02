const Listing = require("../models/Listing")
//maps 
const maptilerCient = require('@maptiler/client')
maptilerCient.config.apiKey = process.env.MAP_KEY;


//loading all the listings
//loading all the listings
module.exports.index = async (req, res) => {
  // q is the query raised from search
  let { q, category } = req.query;

  let filter = {};
  if (category) {
    filter.category = category;
  } else if (q) {
    filter = {
      $or: [
            { title: { $regex: q, $options: "i" } },
            { category: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } }, 
            { country: { $regex: q, $options: "i" } }    
        ]
    };
  }

  const allListings = await Listing.find(filter);
  res.render("Listings/index.ejs", { allListings,q,category }); 
};

module.exports.addNewlisting = async (req, res, next) => {
  // console.log("Req Body is:", req.body.listing);
  // if(!req.body.listing){
  //     throw new ExpressError(400,"Send valid data for Listing")
  // }

  let response = await maptilerCient.geocoding.forward(req.body.listing.location, {
    limit: 1
  })

  //------------------
  let url = req.file.path;
  let filename = req.file.filename;
  console.log(`${url} ... ${filename}`);
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  newListing.geometry = response.features[0].geometry;

  let savedlisting = await newListing.save();
  console.log(savedlisting)
  //listing has been added
  req.flash("success", "New Listing is Added");
  res.redirect("/listing");
  //------------------
  // 1. Extract the listing object from req.body
  // let { listing } = req.body;

  // // 2. Create the listing with the nested image structure already handled
  // const newListing = new Listing({
  //     ...listing, // This spreads title, description, price, etc.
  //     image: {
  //         url: listing.image, // Takes the string from the form
  //         filename: "listingimage"
  //     }
  // });

  //------------
  // try {
  //     const newListing = new Listing(req.body.listing)

  //     await newListing.save();
  //     res.redirect("/listing");
  // } catch (err) {
  //     next(err);
  // }
}

module.exports.renderShowListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
  console.log("Routing to Listing " + id);

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!!");
    res.redirect("/listing");
    return;
  }

  console.log(listing);
  res.render("Listings/show.ejs", { listing });
}

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!!");
    res.redirect("/listing");
    return;
  }
  let orignalImageUrl = listing.image.url;
  orignalImageUrl = orignalImageUrl.replace("/upload", "/upload/ar_1.0,c_fill,h_250/bo_5px_solid_lightblue")
  res.render("Listings/edit.ejs", { listing, orignalImageUrl });
}

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  let { listing } = req.body;

  // We restructure the image so Mongoose sees 'image.url'
  const updatedListing = {
    ...listing,
    image: {
      url: listing.image,
      filename: "listingimage",
    },
  };

  // The SECRET: { runValidators: true } makes your Schema 'set' function work!
  let lst = await Listing.findByIdAndUpdate(id, updatedListing, {

    //  By default, Mongoose only runs validation (checking if a number is positive, if a string is required, etc.) when you create a new document. When you update a document, it skips these checks.

    // Adding runValidators: true forces Mongoose to check your schema rules even during an update.
    runValidators: true,
  });

  //setiing updated image 

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    lst.image = { url, filename };
    await lst.save();
  }

  req.flash("success", "Listing is Updated!!");
  res.redirect(`/listing/${id}`);
}

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing is Deleted!!");
  res.redirect("/listing");
} 

