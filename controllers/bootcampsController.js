const ErrorResponse = require("../utils/errorResponse");
const geocoder = require("../utils/geocoder");
const asyncHandler = require("../middleware/async");
const Bootcamp = require("../models/Bootcamp"); // for crud functionality on Bootcamp

// req. params contains route parameters (in the path portion of the URL)
// req. query contains the URL query parameters (AFTER the ? in the URL)

// @DESCRIPTION     GET ALL BOOTCAMPS
// @ROUTE           GET /api/v1/bootcamps
// @ACCESS?         PUBLIC
/// WHAT? This will get all bootcamps along with average cost and other filtering options, location.city=Boston, careers[in]=business
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	// console.log(req.query); // to see what the starting data looks like
	let query;
	// Copy req.query
	const reqQuery = { ...req.query }; // make copy of user's req.query

	// Fields to remove/exclude
	const removeFields = ["select", "sort"];
	// Loop over and delete removeFields from reqQuery
	removeFields.forEach((param) => delete reqQuery[param]);
	console.log(reqQuery);

	// Create query String
	let queryString = JSON.stringify(reqQuery); // in order to use .replace(), convert to string/array format
	// Create operators($gt, $gte, $in, etc.)
	queryString = queryString.replace(
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`
	);

	// Finding resource
	query = Bootcamp.find(JSON.parse(queryString));

	// Select fields (this will only return the name and description of each bootcamp vs all information of the bootcamps that match. I can choose what to send back)
	if (req.query.select) {
		const fields = req.query.select.split(",").join(" ");
		// console.log(fields);
		query = query.select(fields);
	}

	// To SortBy such as name, createdAt, etc. (uses negative for descending order)
	if (req.query.sort) {
		const sortBy = req.query.sort.split(",").join(" ");
		query = query.sort(sortBy);
	} else {
		query = query.sort("-createdAt");
	}
	// Execute the query
	const bootcamps = await query;
	res
		.status(200)
		.json({ sucess: true, count: bootcamps.length, data: bootcamps });
});

// ------------------------------------------------------------------------------------------------------------------------------------------

// @DESCRIPTION     GET SINGLE BOOTCAMP
// @ROUTE           GET /api/v1/bootcamp/:id
// @ACCESS?         PUBLIC
// remember, will need the id to get the bootcamp
exports.getBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);
	if (!bootcamp) {
		return next(
			// ** If it's a correctly formatted object id number however the id number is not listed in the database.
			new ErrorResponse(
				`Bootcamp not found with the id of ${req.params.id}`,
				404
			)
		);
		// ErrorResponse takes two things, the message and the status code coming from error.js file.
	} else {
		res.status(200).json({ success: true, data: bootcamp });
	}
});

// ------------------------------------------------------------------------------------------------------------------------------------------

// @DESCRIPTION     CREATE NEW BOOTCAMP
// @ROUTE           POST /api/v1/bootcamps
// @ACCESS          ** PRIVATE (will have to setup a token)
exports.createBootcamp = asyncHandler(async (req, res, next) => {
	// console.log(req.body);
	const bootcamp = await Bootcamp.create(req.body);
	res.status(201).json({
		// 201 'Created'
		success: true,
		data: bootcamp,
	});
});

// ------------------------------------------------------------------------------------------------------------------------------------------

// @DESCRIPTION     UPDATE BOOTCAMP
// @ROUTE           PUT /api/v1/bootcamps/:id
// @ACCESS?         ** PRIVATE (will have to setup a token)
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
	// will need to pass in the id the user entered for the bootcamp along with the data to update it with
	const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true, // want to research runValidators more
	});
	if (!bootcamp) {
		// return res.status(400).json({ success: false });
		return next(
			new ErrorResponse(
				`Bootcamp not found with the id of ${req.params.id}`,
				404
			)
		);
	}
	res.status(200).json({
		sucess: true,
		data: bootcamp,
		notes: `the ${req.params.id} was updated successfully`,
	});
});

// ------------------------------------------------------------------------------------------------------------------------------------------

// @DESCRIPTION     DELETE BOOTCAMP
// @ROUTE           DELETE /api/v1/bootcamps/:id
// @ACCESS?         ** PRIVATE (will have to setup a token)
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`Bootcamp not found with the id of ${req.params.id}`,
				404
			)
		);
	}
	res.status(200).json({
		sucess: true,
		data: {},
		fyi: "Bootcamp was deleted",
	});
});

// ------------------------------------------------------------------------------------------------------------------------------------------
// Radius
// @DESCRIPTION     GET BOOTCAMP(S) within a RADIUS
// @ROUTE           DELETE /api/v1/bootcamps/radius/:zipcode/:distance
// @ACCESS?         ** PRIVATE
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
	// 1. extract zipcode and distance from the url
	console.log(req.params); // { zipcode: '02118', distance: '100' }
	const { zipcode, distance } = req.params;
	// 2. pass zipcode into geocoder to get location; this will give access to lat and long
	const loc = await geocoder.geocode(zipcode);
	const lat = loc[0].latitude;
	const long = loc[0].longitude;

	// 3. Calculate radius (using radians;divide the "distance" by Earth's radius of 3,963 miles)
	const radius = distance / 3963;

	// 4. Method:
	// directly from docs: https://docs.mongodb.com/manual/reference/operator/query/centerSphere/
	// x: longitude, y: latitude (in most cases, it's usually the reverse order. )
	const bootcamps = await Bootcamp.find({
		location: {
			$geoWithin: { $centerSphere: [[long, lat], radius] },
		},
	});

	// REturN the DaTa
	res
		.status(200)
		.json({ success: true, count: bootcamps.length, data: bootcamps });
	// console.log(bootcamps);
});

// ------------------------------------------------------------------------------------------------------------------------------------------
/*

The very start...
exports.getBootcamp = (req, res, next) => {
	res.status(200).json({
		success: true,
		message: `SHOW bootcamp ${req.params.id} JUST ONE`,
	});
};


// async/await give access to try/catch to prevent app from crashing (get it working first and then place inside the try method therefore leaving your catch for any errrors)

Before applying the asyncHandler middleware...
exports.getBootcamps = async (req, res, next) => {
	try {
		const bootcamps = await Bootcamp.find();
		// console.log(bootcamps);
		res
			.status(200)
			.json({ sucess: true, count: bootcamps.length, data: bootcamps });
	} catch (err) {
		next(err);
	}
};
By applying the asyncHandler, I was able to remove the try/catch and the async handler will catch the errors. 



*/
