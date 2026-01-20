const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn , isOwner , validateListing} = require("../middleware.js")

//requiring controller after shifting all the async call back to controller
const listingController = require("../controllers/listings.js");

const multer  = require('multer')
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

// copying the ./listing routes from app.js to here 

        //RESTURCTUREING LISITINGS

//INDEX route -->async function is shifted to controllers

// ROUTER.ROUTE 
router
    .route("/")
    .get( wrapAsync(listingController.index))
    // /CREATE route
    .post(isLoggedIn,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.createListing)
);

//NEW Route
router.get("/new" , isLoggedIn,listingController.renderNewForm );

// ROUTER.ROUTE 
router
    .route("/:id")
    //SHOW route
    .get( wrapAsync(listingController.showListing))

    //Update route
    .put(  
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),  //handling images upload while editing form and adding new img
    validateListing,
    wrapAsync(listingController.updateListing)
    )

    .delete(
    isLoggedIn,
    isOwner, 
    wrapAsync(listingController.destroyListing)
    );

//Edit route
router.get("/:id/edit" , 
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm)
);


module.exports = router;
