const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User"); // for crud functionality on Bootcamp

// @DESCRIPTION     to REGISTER A USER
// @ROUTE           GET /api/v1/auth/register
// @ACCESS to:      PUBLIC
exports.register = asyncHandler(async (req, res, next) => {
	// start sending data in the body when we make the post request (need to pull out of req.body)
	// the data being pulled out is derived from the User model
	const {name, email, password, role} = req.body;

	// Create User (will hash password in a piece of middleware so it's hased when a user is saved there instead of in the controller)
	const user = await User.create({
		name,
		email,
		password,
		role
	});

	// Short Term Goal: Get User Register in Databse and ecrypt password	(complete)

	// Long Term Goal: Send back a Token

	res.status(200).json({success: true});
});

// PICK BACK UP WITH ENCRYPTING PASSWORD
