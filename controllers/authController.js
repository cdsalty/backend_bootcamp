const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User"); // for crud functionality on Bootcamp

// @DESCRIPTION     to REGISTER A USER
// @ROUTE           GET /api/v1/auth/register
// @ACCESS to:      PUBLIC
exports.register = asyncHandler(async (req, res, next) => {
	res.status(200).json({
		success: true
	});
});
