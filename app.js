// A variable that tells the app if it's "Live" or "Under Construction."
if (process.env.NODE_ENV != "production") {
    require('dotenv').config()
}

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const Listing = require("./models/Listing");
const path = require("path");
// const { url } = require("inspector");
const methodOverride = require("method-override");

//error Handling
//--------------------------------------------
const WrapAsync = require("./utils/WrapAsync")
const ExpressError = require("./utils/ExpressError")
//--------------------------------------------
const { ListingSchema, ReviewsSchema } = require("./schema");
const Review = require("./models/reviews");

//flash
// // A special area of the session used for storing messages that are cleared immediately after being displayed to the user.
const flash = require("connect-flash");

//Express ROuting 
const listingRouter = require("./routers/listing.js")
const reviewRouter = require("./routers/review.js");
const userRouter = require("./routers/user.js");

const passport = require("passport");
const LocalStratergy = require("passport-local");
const User = require("./models/user.js");



// It allows developers to create reusable HTML structures (like headers/footers) and manage page-specific content,
const ejsMate = require("ejs-mate")

//express session
const session = require("express-session");
const MongoStore = require('connect-mongo').default;





// const { date } = require("joi");
// const user = require("./models/user.js");


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));

// a middleware that allows your Express app to read and understand JSON data sent in a request.
app.use(express.json());
app.use(methodOverride("_method"));

// Use ejs-mate for .ejs files
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

// const MongUrl = "mongodb://127.0.0.1:27017/Wonderlust";
const dbUrl = process.env.ATLASDB_URL;


main().then((res) => {
    console.log("Server is connected to DB");
}).catch((err) => {
    console.log("Server isn't connected due to " + err);
})

async function main() {
    await mongoose.connect(dbUrl);

}

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret:process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => { // Added 'err' parameter to avoid ReferenceError
    console.log("ERROR IN MONGO SESSION STORE", err);
});

//Express session
const secretSession = {
    store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        httpOnly: true,
    }
}



//express session
// ✅ Correct order in app.js

app.use(session(secretSession));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// // This line is the key fix:
// The Workflow Summary:
// Authenticate: "Are these credentials correct?"

// Serialize: "They are! Let's save their ID in a session cookie."

// Deserialize: "Oh, they're back! Let me find the full user details using that ID from their cookie."
passport.use(new LocalStratergy(User.authenticate()));  // authenticate() is correct here
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//global middleware
app.use((req, res, next) => {
    // Prevent browser from caching pages so navbar always reflects auth state
    res.setHeader("Cache-Control", "no-store");

    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    
    res.locals.q = req.query.q || ""; 
    res.locals.category = req.query.category || "";
    next();
})

// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"student@gmail.com",
//         username:"Mrunal-Jagtap",
//     })
//     let registeredUser=await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);

// })

//Express Routing of listing and Reviews
app.use("/listing", listingRouter);
app.use("/listing/:id/reviews", reviewRouter);
app.use("/", userRouter);

//middleware




// app.get("/", (req, res) => {
//     console.log("root reques---------------->");
//     res.send("Here we are !!");

// })


app.get("/", (req, res) => {
    res.redirect("/listing");
});

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});


app.listen(8080, () => {
    console.log("Server is connected to port : 8080")
})

app.use((err, req, res, next) => {
    let { statuscode = 500, message = "Something Went Wrong" } = err;
    res.status(statuscode).render("error.ejs", { message });
    // res.status(statuscode).send(message)
})