const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("../Airbnb/models/listing.js");

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

app.get("/", (req, res) => {
	res.send("Hello World");
});

app.get("/testListing", async (req, res) => {
	let sampleListing = new Listing ({
		title: "My New Villa",
		description: "By the beach",
		price: "12000",
		location: "Calangute, Goa",
		country: "India",
	});
	await sampleListing.save();
	console.log("Sample was saved");
	res.send("Successfull");
});

app.listen("8080", () => {
	console.log("Listening on port 8080");
});     