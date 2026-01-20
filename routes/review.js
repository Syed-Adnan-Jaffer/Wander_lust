const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js")

const reviewControl = require("../controllers/reviews.js");
const review = require("../models/review.js");

// copying the reviews routes from app.js to here 

        //RESTRUCTURING REVIEW


//MVC framework for reviews , shifting callbacks to controller's reviews.js

//REVIEW POST REQUEST
router.post("/" ,           //common part "/listings/:id/reviews" replacing with "/"
    isLoggedIn, //review autorization
    validateReview, //passing validateReview as middleware for validating client side reviews
    //using wrapAsync for error handling
    wrapAsync(reviewControl.createReview));

//DELETING THE REVIEWS , Delete review Route
router.delete("/:reviewId",
    isLoggedIn, 
    isReviewAuthor,
    wrapAsync(reviewControl.destroyReview)
);

module.exports = router;