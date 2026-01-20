const Listing  = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async(req , res)=>{ 
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id; //storing author with associated review when he creates
    listing.reviews.push(newReview); //pushing newReviews in array of listing review

    await newReview.save() //saving newReview
    await listing.save(); //.save() calling becz if we want to edit exsisting DB we have to call save() 
    req.flash("success" , "New Review Added"); //adding flash msg when new review is created
    res.redirect(`/listings/${listing._id}`);
}

module.exports.destroyReview = async(req , res)=>{
        let {id , reviewId} = req.params;
        await Listing.findByIdAndUpdate(id , {$pull: {reviews: reviewId}});
        await Review.findByIdAndDelete(reviewId);
        req.flash("success" , "Review Deleted"); //adding flash msg when review is deleted
        res.redirect(`/listings/${id}`);
};