const Joi = require("joi");

module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().min(0).required(),
    location: Joi.string().required(),
    image: Joi.string().required(),
    description: Joi.string().required().min(10),
  }).required(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    body: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
  }).required(),
});
