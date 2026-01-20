const User = require("../models/user");
module.exports.renderSignupForm = (req , res)=>{
    res.render("users/signup.ejs");
}

module.exports.signup = async(req , res)=>{
    try{
        let {username , email , password} = req.body;
        const newUser = new User({email , username}); //creating new user
        const registedUser = await User.register(newUser , password); //registering user to DB
        console.log(registedUser);
        //AUTOMATICALLY SIGN IN AFTER USER IS REGISTERD
        req.login(registedUser,(err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Welcome to Wanterlust");
        res.redirect("/listings");
        
    });
    }catch(e){
        req.flash("error",e.message); //if user already exsisted it simply catches the error and displays the message
        res.redirect("/signup");
    }
};


module.exports.renderLoginForm = (req , res)=>{
    res.render("users/login.ejs");
};

module.exports.login = async(req , res)=>{
        req.flash("success","Welcome Back to Wanderlust!");
        let redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
}

module.exports.logout = (req , res , next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success" , "You are logged Out!");
        res.redirect("/listings");
    });
}