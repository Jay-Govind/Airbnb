const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

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

// ------------------------------------------------------------------------
// Middleware for Validation (Joi API)
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// ------------------------------------------------------------------------
// Index Route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

// Create Route
app.post("/listings",
    validateListing,
    wrapAsync(async (req, res, next) => {
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
    }));

// Show Route
app.get("/listings/:id",
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findById(id).populate("reviews");
        res.render("listings/show.ejs", { listing });
    }));

// Edit Route
app.get(
    "/listings/:id/edit",
    wrapAsync(
        async (req, res) => {
            let { id } = req.params;
            const listing = await Listing.findById(id);
            res.render("listings/edit.ejs", { listing });
        }
    ));

// Update Route
app.put(
    "/listings/:id",
    validateListing,
    wrapAsync(
        async (req, res) => {
            let { id } = req.params;
            await Listing.findByIdAndUpdate(id, { ...req.body.listing });
            res.redirect(`/listings/${id}`);
        })
);

// Delete Route
app.delete(
    "/listings/:id",
    wrapAsync(
        async (req, res) => {
            let { id } = req.params;
            let deleteListing = await Listing.findByIdAndDelete(id);
            console.log(deleteListing);
            res.redirect("/listings");
        })
);

// ------------------------------------------------------------------------
//Reviews 
// (Post Route)
app.post("/listings/:id/reviews",
    validateReview,
    wrapAsync(async (req, res) => {
        let listing = await Listing.findById(req.params.id);
        let newReview = new Review(req.body.review);

        listing.reviews.push(newReview);

        await newReview.save();
        await listing.save();

        res.redirect(`/listings/${listing._id}`);
    }));

// Delete Review Route
app.delete("/listings/:id/reviews/:reviewId",
    wrapAsync(async (req, res) => {
        let { id, reviewId } = req.params;

        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);

        res.redirect(`/listings/${id}`);
    })
);

// ------------------------------------------------------------------------
// Error Handlers
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something Went Wrong..." } = err;
    res.status(statusCode).render("listings/error.ejs", { err });
});

// ------------------------------------------------------------------------
// Port Connection
app.listen("8080", () => {
    console.log("Listening on port 8080");
});