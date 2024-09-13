const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

const session = require("express-session");
const flash = require("connect-flash");;

const sessionOptions = {
    secret : "mysecretcode",
    resave : false,
    saveUninitialized: true
};
app.use(session(sessionOptions));
app.use(flash());app.get("/register", (req, res) =>{
    let { name = "anonymous"} = req.query;
    req.session.name = name;
    req.flash("success", "user register successfully");clear
    
    // res.send(`Welcome ${name}`);
    res.redirect("/hello");
})
app.get("/hello", (req, res) => {
    res.render("page.ejs", {name : req.session.name, flash : req.flash("success")});
})

// cookies
// const cookieParser = require('cookie-parser');
// app.use(cookieParser("secret"));

// app.get("/cookies", (req, res) => {
//     res.cookie("color", "red",{signed: true});
//     res.send("cookies were sent");
// });

// mongodb Connection
main()
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((err) => {
        console.log(err);
    });
async function main() {
    await mongoose.connect("mongodb://localhost:27017/wanderlust");
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// Root
app.get("/", (req, res) => {
    res.send("Hello ! I am Root. Contact this path (localhost:8080/listings) for listing");
})

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

// Error Handlers
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something Went Wrong..." } = err;
    res.status(statusCode).render("listings/error.ejs", { err });
});

// Port Connection
app.listen("8080", () => {
    console.log("Listening on port 8080");
});