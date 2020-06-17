// Bring in Mongoose
const mongoose = require("mongoose");
const slugify = require("slugify");
const geocoder = require("../utils/geocoder");

// Create new schema
const BootcampSchema = new mongoose.Schema({
	// could do name: String but it needs validation...
	name: {
		type: String,
		required: [true, "Please add a name"], // by use the brackets, we are able to require and give message
		unique: true, // must be different
		trim: true, // to trim off whitespace
		maxlength: [50, "Name must be under 50 characters total"],
	},

	slug: String, // basically a url friendly version of the catagory, 'name' (used for front end and calling the url)

	description: {
		type: String,
		required: [true, "Please add a description"], // by using the brackets, we are able to require and then output a message
		maxlength: [
			500,
			"Please keep the description under 500 characters. (can you try and avoid to much talky talky).",
		],
	},

	website: {
		type: String,
		match: [
			/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
			"Please use a valid URL with HTTP or HTTPS",
		],
		// use MATCH for custom validation. in this case, this verifies it is a valid http or https website. IF DOES'T MATCH, it will say to please use a valid URL...
	},

	phone: {
		type: String,
		maxlength: [
			20,
			"I can't think of a legel phone number over 20 characters... try again please",
		],
	},

	email: {
		type: String,
		match: [
			/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
			"Please add a valid email",
		],
	},
	// the address will be the address that's sent to our server from the client; it will make use of a geo-coder that will go in and pull parts out; this will allow us to have a GEO-JSON location field.
	address: {
		type: String,
		required: [true, "Please add an address"],
	},

	location: {
		// GeoJSON Point  -- copied from Mongoose docs
		type: {
			type: String,
			enum: ["Point"], // the only valid value this can be
		},
		coordinates: {
			type: [Number], // will be an array of numbers.
			index: "2dsphere",
		},
		// the next key values are from the mapquest api
		formattedAddress: String,
		street: String,
		city: String,
		state: String,
		zipcode: String,
		country: String,
	},

	careers: {
		// Array of strings (which is why I have the brackets around 'String')
		type: [String],
		required: true,
		enum: [
			"Web Development",
			"Mobile Development",
			"UI/UX",
			"Data Science",
			"Business",
			"Other",
		],
	},

	averageRating: {
		type: Number,
		min: [1, "Rating must be at least 1"],
		max: [10, "Rating must can not be more than 10"],
	},

	averageCost: Number,

	photo: {
		type: String,
		default: "no-photo.jpg",
	},

	housing: {
		type: Boolean,
		default: false,
	},

	jobAssistance: {
		type: Boolean,
		default: false,
	},

	jobGuarantee: {
		type: Boolean,
		default: false,
	},

	acceptGi: {
		type: Boolean,
		default: false,
	},

	createdAt: {
		type: Date,
		default: Date.now,
	},
});

// Create Bootcamp Slug ( off the name entered )
BootcampSchema.pre("save", function (next) {
	this.slug = slugify(this.name, { lower: true }); // RETURNS: "slug": "devworks-bootcamp"
	next();
});

// Geocode and Create Location Field (https://github.com/nchaulet/node-geocoder)
//	// before saving, do the following
BootcampSchema.pre("save", async function (next) {
	// CREATING OUR OWN JSON LAYOUT (REEEEALLLLYY CCCOOOOOLLLL )
	const loc = await geocoder.geocode(this.address);
	// console.log(loc);
	// this.location is an example of creating an object inside an array. it will show up as an object to drop down and drill into to get type, formattedAddress, street, etc.
	this.location = {
		// coming from the schema defined up top because of enum value
		type: "Point",
		// (NOTE) gets longitude first instead of lat
		coordinates: [loc[0].longitude, loc[0].latitude],
		formattedAddress: loc[0].formattedAddress,
		street: loc[0].streetName,
		city: loc[0].city,
		state: loc[0].stateCode,
		zipcode: loc[0].zipcode,
		country: loc[0].countryCode,
	};

	// Do not save the address as a variable in DB instead using it to pull from this.location; 'formattedAddress' does this
	this.address = undefined; // **** NOTE TO SELF TO REMEMBER   ***** the address being typed in as one entire string from user
});

module.exports = mongoose.model("Bootcamp", BootcampSchema); // this should allow us to start using this model within the controllers to fetch data, etc... (the name of the model and the bootcamp schema)

/* 
Slug/Slugify Notes: 
(pre will run before BEFORE THE OPERATION) It will run BEFORE the document is saved. (not using arrow function due to scope)
// create slug field (creating it from the name field) // documentation shows all options such as lower: true

the data I created and returned looked as following:
"location": {
						"type": "Point",
						"formattedAddress": "233 Bay State Rd, Boston, MA 02215-1405, US",
						"street": "233 Bay State Rd",
						"city": "Boston",
						"state": "MA",
						"zipcode": "02215-1405",
						"country": "US"
				},
https://docs.mongodb.com/manual/reference/operator/query/centerSphere/
- for assistance in getting bootcamps within a radius.
*/
