const ErrorResponse = require("../utils/errorResponse");

// the pattern to follow https://expressjs.com/en/guide/error-handling.html

const errorHandler = (err, req, res, next) => {
	// Create a copy of err by extracting the properties from the object with spread operator
	// this gives access to the error details (ex: error.whatever)
	// console.log(err)	--> also gives access to the validationerrors, later to be used for validating required fields.
	let error = { ...err };
	error.message = err.message;
	console.log(err.stack.red); // Log to console to verify; gives access to message and stack

	// Mongoose duplicate key check
	console.log(err); // returns a list of objects/key-value pairs. name: 'MongoError', code: 11000, errmesg, index, etc.
	if (err.code === 11000) {
		const message = "Duplicate field value entered";
		error = new ErrorResponse(message, 400);
	}

	// Mongoose Validation Error (verify required fields)
	if (err.name === "ValidationError") {
		const message = Object.values(err.errors).map((value) => value.message);
		// err returns an array of object's; one is errors. going through each value of err.errors, then mapping through it and for each value mapped over it, returning it's value.
		error = new ErrorResponse(message, 400);
	}

	// Mongoose BAD Object.ID (// console.log(err.name);  // Returns 'CastError' (now, use this name to compare for error below.))
	if (err.name === "CastError") {
		const message = `RESOURCE not found with the id of ${err.value}`;
		// bringing in the error we get access to in line 7
		error = new ErrorResponse(message, 404); // THE ERROR RESPONSE INSIDE THE CATCH; The ErrorResponse layout and functionality is being carried over
	}

	// carry the functionaility of error down from the error on line 7
	res.status(error.statusCode || 500).json({
		success: false,
		error: error.message || `Server Error`,
	});
};

module.exports = errorHandler;

/*

// Mount routers to url
app.use("/api/v1/bootcamps", bootcamps);
// Inserting error-hanlder(for errs with next())          --- must call after the route where the middleware is being applied
app.use(errorHandler);


*/
