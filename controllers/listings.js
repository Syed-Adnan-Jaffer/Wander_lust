const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({accessToken: mapToken});


module.exports.index = async(req , res)=>{
    let search = req.query.search || "";
    let allListings;
    if(search){
        allListings = await Listing.find({
            $or: [
                { title: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
                { country: { $regex: search, $options: "i" } }
            ]
        });
        if(allListings.length === 0){
            req.flash("error", "No results found");
            return res.redirect("/listings");
        }
    }else{
        allListings = await Listing.find({});
    }
    res.render("listings/index.ejs" , {allListings});
}

//New route call back
module.exports.renderNewForm = (req , res)=>{
    res.render("listings/new.ejs")
}


//show route call back
module.exports.showListing = async (req , res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({path:"reviews" , 
        populate:{
            path: "author",
        },
    })
    .populate("owner"); //using populate func for getting listing along with data rather than obj
    //flash failure message when user tries to access the deleted listing
    if(!listing){
        req.flash("error" ,"Listing you requested for does not exist!");
        return res.redirect("/listings"); //redirecting back to listing page if the listing is not available
    } 
    res.render("listings/show.ejs" , {listing});
}


//show route call back
module.exports.createListing = async (req , res , next)=>{
        // if(!req.body.listing){
        //    throw new ExpressError(400,"Send valid data for Listing")
        // 
        //USING JOI API FOR LISTING VALIDATION EXPLAINED BELOW
        // let result = listingSchema.validate(req.body);
        // console.log(result);
        // if(result.error){ //if result has any error thn
        //     throw new ExpressError(400 , result.error);
        // }    //  USING validateListing as MIDDELWARE TO VALIDATE SO IT IS COMMENTED
        
        let response = await geocodingClient.forwardGeocode({   //GEOCODING GITHUB-SDK CLIENT
            query: req.body.listing.location,
            limit: 1,
        })
        .send()  

        let url = req.file.path;  //saving image upload url to mongo
        let filename = req.file.filename;
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;  //saving current user info
        newListing.image = {url , filename};
        newListing.geometry = response.body.features[0].geometry;  //saving coordinates of location in DB
        await newListing.save();
        req.flash("success" , "New Listing Created"); //adding flash msg when new listing is created
        res.redirect("/listings");
};

module.exports.renderEditForm = async(req , res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error" ,"Listing you requested for does not exist!");
        return res.redirect("/listings"); //redirecting back to listing page if the listing is not available
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300,w_300");
    res.render("listings/edit.ejs" , {listing , originalImageUrl });
};

module.exports.updateListing = async(req , res)=>{
    // if(!req.body.listing){    //it checks wheathere the listing schema is present or not before addung to DB
    //         throw new ExpressError(400,"Send valid data for Listing")  //but it doesnt apply for individual things in listing like if we didn't add description
    // }    USING validateListing MIDDLEWARE                               //or location it simply adds to DB without any error so to overcome that we have to validate every                    
                                                                            //every single element ; there are 2 ways 1 is validating by using if conditon on evry single element one by one 
    let { id } = req.params;                                                    //which is not convectional so we use API called JOI
    let listing = await Listing.findByIdAndUpdate(id , {...req.body.listing}); //JS object 
    
    if(typeof req.file != "undefined") {
        let url = req.file.path;  //saving the updated image to cloud after editing listing by channging image
        let filename = req.file.filename;
        listing.image = {url , filename};
        await listing.save();
    }
    req.flash("success" , "Listing Updated"); //adding flash msg when new listing is updated
    res.redirect(`/listings/${id}`);
};

//delete route
module.exports.destroyListing = async (req , res)=>{
    let { id } = req.params;
    let deleteLising = await Listing.findByIdAndDelete(id);
    console.log(deleteLising);
    req.flash("success" , "Listing Deleted"); //adding flash msg when  listing is deleted
    res.redirect("/listings");
};