if(process.env.NODE_ENV != "production"){
    require('dotenv').config();        //acessing env file
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo').default;  //requiring mango-store
const flash = require("connect-flash");
const passport = require("passport"); //requiring passport
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

//RESTURCTURING OF LISTING AND REVIWES ,    ROUTERS
const listingRouter = require("./routes/listing.js");  
const reviewRouter = require("./routes/review.js") 
const userRouter = require("./routes/user.js") //USER SIGN-UP ROUTER


//creating Database by async function
const dbURL = process.env.ATLASDB_URL;


//calling the main function
main()
    .then(()=>{
        console.log("connected to DB")
    })
    .catch((err)=>{
        console.log(err);
    })
async function main() {
    await mongoose.connect(dbURL);  //replacing mongo url with atlas
}

app.set("view engine", "ejs");
app.set("views" , path.join(__dirname , "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

//USING SESSION


//mongo Store
const store = MongoStore.create({
    mongoUrl: dbURL,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error",(err)=>{
    console.log("ERROR in MONGO STORE" , err);
})
//DEFINING SESSION OPTIONS
const sessionOptions  ={
    store, //passing mongostore
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 1000 * 60 * 60 * 24 * 3,
        maxAge: 1000 * 60 * 60 * 24 * 3,
        httpOnly: true
    },
};

// app.get("/",(req , res)=>{
//     res.send("Hi i, root");
// });


app.use(session(sessionOptions));
//USING FLASH
app.use(flash());

//passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser()); //Generates a function that is used by Passport to serialize users into the session
passport.deserializeUser(User.deserializeUser()); //Generates a function that is used by Passport to deserialize users into the session

 
app.use((req , res , next)=>{
    res.locals.success = req.flash("success"); //success flash
    res.locals.error = req.flash("error");  //error flash
    res.locals.currUser = req.user;  //logIn, LogOut and SignUp options used in navbar.ejs template
    next();
});

app.get("/demouser", async(req , res)=>{
    let fakeUser = new User({
        email: "student@gmail.com",
        username: "delta-student",
    });

    //storing fakeuser
    let registedUser = await User.register(fakeUser, "helloworld");  //register is a static function , username-> fakeuser and passowrod is helloworld
    res.send(registedUser);
})


//EXPRESS ROUTER FOR LISTINGS , ALL THE LISTING ROUTES ARE TRANSFEERED TO LISTING FILE IN ROUTE FOLDER
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews" , reviewRouter);
app.use("/" , userRouter);


//Error handling if user send request to any page that is not exsist
app.all(/.*/, (req , res , next)=>{
    next(new ExpressError(404 , "Page Not Found!"));
});

//error handling middleware
app.use((err , req , res , next)=>{
    let {statusCode=500 , message="Something went Wrong" } = err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message)
})

app.listen(8080 , ()=>{
    console.log("server is listining");
})