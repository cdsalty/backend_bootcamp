const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User"); // for crud functionality on Bootcamp

// @DESCRIPTION     to REGISTER A USER
// @ROUTE           POST /api/v1/auth/register
// @ACCESS to:      PUBLIC
exports.register = asyncHandler(async (req, res, next) => {
	// start pulling data from the body when we make the post request (need to pull out of req.body)
	// the data being pulled out is derived from the User model object created
	const {name, email, password, role} = req.body;

	// Create USER (will hash password in a piece of middleware so it's hased when a user is saved there instead of in the controller)
	const user = await User.create({
		name,
		email,
		password,
		role
	});

	// Create TOKEN
	// const token = user.getSignedJwtToken();
	// res.status(200).json({success: true, token: token});
	sendTokenResponse(user, 200, res); // updated with helper function
});

// @DESCRIPTION     * LOGIN User*
// @ROUTE           POST /api/v1/auth/login
// @ACCESS to:      PUBLIC
exports.login = asyncHandler(async (req, res, next) => {
	const {email, password} = req.body; // only need to pull email and password from request body
	// 1. Validate email & password:
	if (!email || !password) {
		return next(new ErrorResponse("Please provide an email and password", 400));
	}
	// 2. Get user (using mongo 'findOne' method) (add .select method to include the password in order to also validate)
	const user = await User.findOne({email: email}).select("+password");
	// 3. Verify User Exist
	if (!user) {
		return next(new ErrorResponse("Invalid User Credientials", 401)); // 401 unauthorized
	}
	// 4. Check if Password Matches(the encrypted password; need create a model method to match password inside the User model);
	const isMatch = await user.matchPassword(password); // this returns a promise, coming from the matchPassword() method in User.js
	if (!isMatch) {
		// if the password is correct, it will proceed to creating a token
		return next(new ErrorResponse("Invalid User Credientials", 401)); // must match if !user so user can't tell which isn't matched, the email or password
	}
	sendTokenResponse(user, 200, res);
});

// 5(updated)Get token from model, Create cookie and send with Response (replace other code.)
const sendTokenResponse = (user, statusCode, res) => {
	// copy paste Create Token from login and register
	const token = user.getSignedJwtToken(); // Creates token
	// create cookie:
	const options = {
		expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000), // 30 * 24 * 60 * 60 * 1000 to get days...?
		httpOnly: true
	};

	res
		.status(statusCode)
		.cookie("token", token, options) // key, the value, and the options
		.json({
			success: true,
			token
		});
};

/* for the protected routes, instead of just pulling it from the local storage, I will send a cookie to the client with the token inside it.
- to do this, will create a helper function that will create the token as well as adding the functionality of sending a cookie with the token in it.
		-- will also have a logout route that will clear the cookie. 
	https://www.npmjs.com/package/cookie-parser
	----------

 5. Create TOKEN was Replaced with sendTokenResponse helper function)
	// const token = user.getSignedJwtToken();
	// res.status(200).json({success: true, token: token});
*/
