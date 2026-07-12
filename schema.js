// Server side Validation
const joi = require("joi");

module.exports.ListingSchema = joi.object({
    listing: joi.object({
        title: joi.string().required(),
        description: joi.string().required(),
        location: joi.string().required(),
        country: joi.string().required(),
        price: joi.number().required().min(0),
        image: joi.string().allow("", null).optional(),
        // Add category validation here
        category: joi.string().valid(
            "Trending", 
            "Rooms", 
            "Iconic Cities", 
            "Mountains", 
            "Castles", 
            "Amazing Pools", 
            "Camping", 
            "Farms", 
            "Arctic", 
            "Domes", 
            "Boats"
        ),
    }).required(),
});

module.exports.ReviewsSchema = joi.object({
    review: joi.object({
        rating: joi.number().required().min(1).max(5),
        comment: joi.string().required(),
    }).required(),
});