const path = require("path");
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
	// console.log(req.query);
	let query;
	const reqQuery = {...req.query}; // make copy of the req.query object
	const removeFields = ["select", "sort", "page", "limit"]; // fields that will be excluded and removed from the params
	removeFields.forEach((param) => delete reqQuery[param]); // Loop over and DELETE REMOVEFIELDS FROM reqQuery.
	// console.log(`The req.query is ${reqQuery}`);

	// For Money Operater to display
	// Convert reqQuery to string in order to use the replace method.
	let queryString = JSON.stringify(reqQuery);
	// Create operators($gt, $gte, $in, etc.)
	queryString = queryString.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

	// Finding resource (in regards to the virtual created inside of courses to show name and description)
	query = Bootcamp.find(JSON.parse(queryString)).populate("courses"); // could pass in an object to limit the fields displayed as done insided the coursesController

	// Select fields (this will only return the name and description of each bootcamp vs all information of the bootcamps that match.)
	if (req.query.select) {
		const fields = req.query.select.split(",").join(" ");
		// console.log(fields);
		query = query.select(fields);
	}

	// SORT (use negative number to sort by descending order) ------------------------------------
	if (req.query.sort) {
		const sortBy = req.query.sort.split(",").join(" ");
		query = query.sort(sortBy);
	} else {
		query = query.sort("-createdAt");
	}

	// PAGINATION ------------------------------------
	const page = parseInt(req.query.page, 10) || 1; // ignoring page and assigning the value as an integer; default page 1;
	const limit = parseInt(req.query.limit, 10) || 10; // default is 10 per page
	const startIndex = (page - 1) * limit; // to configure how many resources/bootcamps to skip;
	// console.log(`the starting index amount is ${startIndex}`);
	const endIndex = page * limit;
	const total = await Bootcamp.countDocuments(); // mongo method...

	query = query.skip(startIndex).limit(limit);

	// Execute the query
	const bootcamps = await query;

	// Pagination Results
	const pagination = {}; // pagination object

	if (endIndex < total) {
		pagination.next = {
			page: page + 1,
			limit: limit
		};
	}

	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit
		};
	}

	res
		.status(200)
		.json({sucess: true, count: bootcamps.length, pagination, data: bootcamps});
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
			new ErrorResponse(`Bootcamp not found with the id of ${req.params.id}`, 404)
		);
		// ErrorResponse takes two things, the message and the status code coming from error.js file.
	} else {
		res.status(200).json({success: true, data: bootcamp});
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
		data: bootcamp
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
		runValidators: true // want to research runValidators more
	});
	if (!bootcamp) {
		// return res.status(400).json({ success: false });
		return next(
			new ErrorResponse(`Bootcamp not found with the id of ${req.params.id}`, 404)
		);
	}
	res.status(200).json({
		sucess: true,
		data: bootcamp,
		notes: `the ${req.params.id} was updated successfully`
	});
});

// ------------------------------------------------------------------------------------------------------------------------------------------

// @DESCRIPTION     DELETE BOOTCAMP
// @ROUTE           DELETE /api/v1/bootcamps/:id
// @ACCESS?         ** PRIVATE (will have to setup a token)
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
	// in order to pass the mongoose middleware, must use 'findById' and then check it and THEN you can call the remove method created from the pre(middleware)
	// const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
	const bootcamp = await Bootcamp.findById(req.params.id);
	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp not found with the id of ${req.params.id}`, 404)
		);
	}

	bootcamp.remove(); // the remove is being triggered from the 'remove' called in the pre method before saving; inside Bootcamp.js

	res.status(200).json({
		sucess: true,
		data: {},
		fyi: "Bootcamp was deleted"
	});
});

// ---------------------------------------------------------------------------------------------------------------

// Radius
// @DESCRIPTION     GET BOOTCAMP(S) within a RADIUS
// @ROUTE           DELETE /api/v1/bootcamps/radius/:zipcode/:distance
// @ACCESS?         ** PRIVATE
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
	// 1. extract zipcode and distance from the url
	console.log(req.params); // { zipcode: '02118', distance: '100' }
	const {zipcode, distance} = req.params;
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
			$geoWithin: {$centerSphere: [[long, lat], radius]}
		}
	});

	// REturN the DaTa
	res.status(200).json({success: true, count: bootcamps.length, data: bootcamps});
	// console.log(bootcamps);
});

// ------------------------------------------------------------------------------------------------------------
// @DESCRIPTION     UPLOAD PHOTO for BOOTCAMP
// @ROUTE           PUT /api/v1/bootcamps/:id/photo
// @ACCESS?         ** PRIVATE (will have to setup a token)
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);
	// check for bootcamp:
	if (!bootcamp) {
		return next(
			new ErrorResponse(`The Bootcamp with an id of ${req.params.id} was not found`, 404)
		);
	}

	// Check if photo was uploaded  (documentation from the npm package express-fileupload)
	if (!req.files) {
		return next(new ErrorResponse(`Please UPLOAD a file`, 404));
	}
	// verify the image is photo (vs. text document, etc., using the mime type that is sent back from req.files.file)
	// console.log(req.files.file);

	const file = req.files.file; // file represents the data that comes back from the photo

	if (!file.mimetype.startsWith("image")) {
		// if the mimetype does not start with image,
		return next(new ErrorResponse("Please upload an image file"), 404);
	}

	// Check File Size: (data referenced in .env)
	if (file.size > process.env.MAX_FILE_UPLOAD) {
		return new ErrorResponse(
			`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`
		);
	}

	// Create Custom File Name (to save each photo with a unique file name: (the goal: prevent over-writting any files with the same name))
	file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
	// example of the data returned: photo_5d725a1b7b292f5f8ceff788; by using .ext we are able to get the extension such as jpg
	// console.log(file.name);
	// To save and move the file to custom directory: the file, make use of the 'mv' method that is returned from req.files.file.
	file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
		if (err) {
			console.log(err);
			return next(new ErrorResponse(`There is a problem with the file upload`, 504));
		}
		await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name}); // get the info, and with the photo data, give it the photo/file name

		res.status(200).json({
			sucess: true,
			data: file.name,
			fyi: "The photo upload was a success"
		});
	});
});

// End of file

// ------------------------------------------------------------------------------------------------------------

// END OF FILE;

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
