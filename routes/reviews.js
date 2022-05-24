const express = require("express");
const router = express.Router({ mergeParams: true });

// Models
const Campground = require("../models/campground");
const Review = require("../models/review");

// Utilities
const catchAsync = require("../utils/catchAsync");
const reviews = require("../controllers/reviews");
const {
  validateReview,
  isLoggedIn,
  isReviewAuthor,
} = require("../utils/middlewares");

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
