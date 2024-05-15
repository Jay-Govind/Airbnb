const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

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
	res.send("Hello World");
});

// Index Route
app.get("/listings", async (req, res) => {
	const allListings = await Listing.find({});
	res.render("listings/index.ejs", { allListings });
});

// New Route
app.get("/listings/new", (req, res) => {
	res.render("listings/new.ejs");
});

// Show Route
app.get("/listings/:id", async (req, res) => {
	let { id } = req.params;
	const listing = await Listing.findById(id);
	res.render("listings/show.ejs", { listing });
});

// Create Route
app.post("/listings", async (req, res) => {
	const newListing = new Listing(req.body.listing);
	await newListing.save();
	res.redirect("/listings");
});

// Edit Route
app.get("/listings/:id/edit", async (req, res) => {
	let { id } = req.params;
	const listing = await Listing.findById(id);
	res.render("listings/edit.ejs", { listing });
});

// Update Route
app.put("/listings/:id", async (req, res) => {
	let { id } = req.params;
	await Listing.findByIdAndUpdate(id, { ...req.body.listing });
	res.redirect(`/listings/${id}`);
});

// Delete Route
app.delete("/listings/:id", async (req, res) => {
	let { id } = req.params;
	let deleteListing = await Listing.findByIdAndDelete(id);
	console.log(deleteListing);
	res.redirect("/listings");
});

// Demo Route
// app.get("/testListing", async (req, res) => {
// 	let sampleListing = new Listing ({
// 		title: "My New Villa",
// 		description: "By the beach",
// 		price: "12000",
// 		location: "Calangute, Goa",
// 		country: "India",
// 	});
// 	await sampleListing.save();
// 	console.log("Sample was saved");
// 	res.send("Successfull");
// });

app.listen("8080", () => {
	console.log("Listening on port 8080");
});
