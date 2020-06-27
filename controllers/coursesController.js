const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @DESCRIPTION     Get all COURSES or COURSES WITHIN A SPECIFIC BOOTCAMP
// @ROUTE           GET /api/v1/courses
// @ROUTE           GET /api/v1/bootcamps/:bootcampId/courses
// @ACCESS?         PUBLIC
// initialize a query variable; test if bootcampId exist;
//    `-->if it does, display specific courses and if not, display all courses
// populate: will populate all the data or the exact data you want inside the JSON return call
exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;
  if (req.params.bootcampId) {
    query = Course.find({
      bootcamp: req.params.bootcampId
    });
  } else {
    // else... return Courses
    // query = Course.find().populate('bootcamp'); // too much data
    query = Course.find().populate({
      path: 'bootcamp', // show the bootcamp data
      select: 'name description' // BUT ONLY NAME & DESCRIPTION
    });
  }
  const courses = await query;

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});

// @DESCRIPTION     Get a single COURSE
// @ROUTE           GET /api/v1/courses/:id
// @ACCESS          PUBLIC
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });
  // Always verify what your searching for is actually there.
  if (!course) {
    return next(new ErrorResponse(`no course with id of ${req.params.id} exist`), 404);
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

// @DESCRIPTION     ADD COURSE
// @ROUTE           GET /api/v1/bootcamps/:bootcampId/courses
// since a course is associated by bootcamps, the bootcampId is needed; will use resource controller
// @ACCESS          PRIVATE
exports.addCourse = asyncHandler(async (req, res, next) => {
  // needs to be submitted IN THE BODY field because in course model, bootcamp is a field. assign to body
  req.body.bootcamp = req.params.bootcampId; // to get the id submitted inside the bootcamp field
  // ** REVIEW this above

  // get bootcamp
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  // Always verify what your searching for is actually there.
  if (!bootcamp) {
    return next(
      new ErrorResponse(`no bootcamp with id of ${req.params.bootcampId} exist`),
      404
    );
  }
  // after getting bootcamp, CREATE NEW COURSE  (req.body: anything from body, the bootcamp)
  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course
  });
});

/*
By creating a virtual field, I was able to produce this information INSIDE get all bootcamps
            "courses": [
                {
                    "scholarshipAvailable": false,
                    "_id": "5d725cfec4ded7bcb480eaa6",
                    "title": "Software QA",
                    "description": "This course will teach you everything you need to know about quality assurance",
                    "weeks": "6",
                    "tuition": 5000,
                    "minimumSkill": "intermediate",
                    "bootcamp": "5d725a1b7b292f5f8ceff788",
                    "createdAt": "2020-06-19T05:08:54.930Z",
                    "__v": 0
                },
*/
