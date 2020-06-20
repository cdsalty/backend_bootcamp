const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');

// @DESCRIPTION     Get all COURSES
// @ROUTE           GET /api/v1/courses
// @ROUTE2          GET /api/v1/bootcamps/:bootcampId/courses
// @ACCESS?         PUBLIC
exports.getCourses = asyncHandler(async (req, res, next) => {
  // initialize a query variable and test to see if bootcamp exist.
  let query;
  // first-check if a bootcampId exist. If it does, then return only courses from that bootcamp; ELSE, get all courses
  if (req.params.bootcampId) {
    // don't need await here because I'm building the query.
    query = Course.find({
      bootcamp: req.params.bootcampId
    });
  } else {
    // return Courses
    query = Course.find();
  }
  const courses = await query;

  res.status(200).json({
    // I wasn't sure what I needed to pass in here. Go back and remember the setup
    success: true,
    count: courses.length,
    data: courses
  });
});
