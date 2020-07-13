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
	const token = user.getSignedJwtToken();
	res.status(200).json({success: true, token: token});
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
	// 4. Check Password (veryify it matches the encrypted password; need create a model method to match password inside the User model);
	const isMatch = await user.matchPassword(password); // this is a promise, coming from the matchPassword() method in User.js
	if (!isMatch) {
		// if the password is correct, it will proceed to creating a token
		return next(new ErrorResponse("Invalid User Credientials", 401)); // must match if !user so user can't tell which isn't matched, the email or password
	}
	// 5. Create TOKEN
	const token = user.getSignedJwtToken();
	res.status(200).json({success: true, token: token});
	// 6. REMEMBER TO BRING IN & CREATE THE ROUTE! (inside auth.js route)
});

/* for the protected routes, instead of just pulling it from the local storage, I will send a cookie to the client with the token inside it.
- to do this, will create a helper function that will create the token as well as adding the functionality of sending a cookie with the token in it.
		-- will also have a logout route that will clear the cookie. 
*/
