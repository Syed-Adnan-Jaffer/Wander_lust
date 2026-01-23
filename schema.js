const Joi = require('joi');
const review = require('./models/review');

module.exports.listingSchema = Joi.object({
    listing : Joi.object({
        title : Joi.string().required(),
        description :  Joi.string().required(),
        location :  Joi.string().required(),
        country :  Joi.string().required(),
        price :  Joi.number().required().min(0), //setting min val of price to 0
        image: Joi.object({
            url: Joi.string().allow("", null).optional(),
            filename: Joi.string().allow("", null).optional()
        }), //allowing image to b non required compulsorily
        category: Joi.array().single().items(Joi.string().valid("mountains", "arctic", "farms", "deserts", "beaches", "movies", "castles", "iconic cities", "amazing pools", "camping", "trending", "rooms", "domes", "boats")).required()
    }).required()
})

//REVIEW SERVER SIDE VALIDATION SCHEMA

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required()
})