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

  // Guard: image upload must succeed
  if (!req.file) {
    req.flash("error", "Image upload failed. Please try again.");
    return res.redirect("/listing/new");
  }

  // Geocoding (maptiler) — get coordinates from location string
  let geometry;
  try {
    let response = await maptilerCient.geocoding.forward(req.body.listing.location, { limit: 1 });
    if (response.features && response.features.length > 0) {
      geometry = response.features[0].geometry;
    }
  } catch (geoErr) {
    console.log("Geocoding failed:", geoErr.message);
    // Continue without geometry — map won't show but listing still saves
  }

  let url = req.file.path;
  let filename = req.file.filename;
  console.log(`${url} ... ${filename}`);

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  if (geometry) newListing.geometry = geometry;

  let savedlisting = await newListing.save();
  console.log(savedlisting);

  req.flash("success", "New Listing is Added");
  res.redirect("/listing");
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

  // Do NOT spread listing directly — it may contain image:undefined from multer removing the file field.
  // Only pass the text fields; image is handled separately below.
  const fieldsToUpdate = {
    title: listing.title,
    description: listing.description,
    price: listing.price,
    country: listing.country,
    location: listing.location,
    category: listing.category,
  };

  let lst = await Listing.findByIdAndUpdate(id, fieldsToUpdate, {
    runValidators: true,
    new: true,
  });

  // Only update image if a new file was actually uploaded
  if (req.file) {
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

