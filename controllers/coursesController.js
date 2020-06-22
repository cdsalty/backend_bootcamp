const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');

// @DESCRIPTION     Get all COURSES or COURSES WITHIN A SPECIFIC BOOTCAMP
// @ROUTE           GET /api/v1/courses
// @ROUTE           GET /api/v1/bootcamps/:bootcampId/courses
// @ACCESS?         PUBLIC
// initialize a query variable; test to see if bootcampId exist;
//    `-->if it does, display specific courses and if not, display all courses
exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;
  if (req.params.bootcampId) {
    query = Course.find({
      bootcamp: req.params.bootcampId
    });
  } else {
    // return Courses
    query = Course.find();
  }
  const courses = await query;

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});
