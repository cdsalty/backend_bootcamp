// https://github.com/nchaulet/node-geocoder
const NodeGeocoder = require("node-geocoder");

const options = {
	provider: process.env.GEOCODER_PROVIDER,
	httpAdapter: "https",
	apiKey: process.env.GEOCODER_API_KEY,
	formatter: null,
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;

// need this package to get all the details from a user's address (county, coordinates, etc)
