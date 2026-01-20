const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema , reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req , res , next)=>{
    if(!req.isAuthenticated()) {
        //POST-LOGIN PAGE
        //redirect URL save
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in to create listing");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl= (req , res , next) =>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async(req , res , next)=>{
    let { id } = req.params;       
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error" , "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

//making miidleware for joi function validation FOR LISTING
module.exports.validateListing = (req , res ,  next)=>{
    let {error}= listingSchema.validate(req.body);
    if(error){ //if result has any error thn
        let errMsg = error.details.map((el) => el.message).join(","); // printing all error details when occursno
        throw new ExpressError(400 , errMsg);
    }else{
        next();
    }
};

//making miidleware for joi function validation FOR REVIEWS
module.exports.validateReview = (req , res ,  next)=>{
    let {error}= reviewSchema.validate(req.body);
    if(error){ //if result has any error thn
        let errMsg = error.details.map((el) => el.message).join(","); // printing all error details when occursno
        throw new ExpressError(400 , errMsg);
    }else{
        next();
    }
};

module.exports.isReviewAuthor = async(req , res , next)=>{
    let { id , reviewId } = req.params;       
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error" , "You are not the Author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};