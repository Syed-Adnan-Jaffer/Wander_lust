const express = require("express");
const router = express.Router();
const User = require("../models/user.js");  //requiring user modules
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

//MVC framework
const userController = require("../controllers/users.js");

//Router.route
router
    .route("/signup")
    .get( userController.renderSignupForm)
    
    //saving user to DB
    .post( wrapAsync(userController.signup));




//login Registerd user 
// router.route 
router
    .route("/login")
    .get( userController.renderLoginForm )
    .post(
        saveRedirectUrl,
        passport.authenticate("local" , {
        failureRedirect: '/login' ,
        failureFlash: true
        }),
        userController.login  //login MVC framework
    );


router.get("/logout", userController.logout);

module.exports = router; 