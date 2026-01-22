const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js")

const listingSchema = new Schema({
    title :{
        type: String,
        required : true,
    },
    description : String,
    image: {
        url: String,
        filename: String,
    },
    price : Number,
    location : String,
    country : String,
    reviews:[
        {
            type: Schema.Types.ObjectId,
            ref:"Review",
        },
    ],
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    geometry: {  //STORING COORDINATES IN DB
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        },
    },
    category:{
        type: [String],
        enum:["mountains" , "arctic" , "farms" , "deserts" , "beaches" , "movies" , "castles" , "iconic cities" , "amazing pools" , "camping" , "trending" , "rooms" , "domes" , "boats"],
        default: ["trending"],
    }
});

//mongoose middleware --> For deletion of review when we delete the listing 
listingSchema.post("findOneAndDelete", async (listing) => {
    if(listing){
        await Review.deleteMany({_id : {$in: listing.reviews} });
    }
});

const Listing = mongoose.model("Listing" , listingSchema);
module.exports = Listing; 