const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
	title: {
		type: String,
		required: true,
	},
	description: String,
	image: {
		type: String,
		default: "https://unsplash.com/photos/brown-wooden-lounge-chairs-near-pool-surrounded-by-palm-trees-vmIWr0NnpCQ",
		set: (v) =>
			v === ""
				? "https://unsplash.com/photos/brown-wooden-lounge-chairs-near-pool-surrounded-by-palm-trees-vmIWr0NnpCQ"
				: v,
	},
	price: Number,
	location: String,
	country: String,
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
