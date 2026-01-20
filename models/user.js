const mongoose = require("mongoose");
const Schema  = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email:{
        type: String,
        required: true,      //we add only email becz the local mongoose will add username and password automatically
    },
});

userSchema.plugin(passportLocalMongoose); //this will add the username and password 
module.exports = mongoose.model('User', userSchema);