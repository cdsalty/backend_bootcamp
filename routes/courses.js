const express = require("express");
const {
	getCourses,
	getCourse,
	addCourse,
	updateCourse,
	deleteCourse
} = require("../controllers/coursesController");

// Bringing in the middleware functionalitly for 'advancedResults'(bring in Course, advancedResults)
const Course = require("../models/Course");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router({mergeParams: true}); // to merge bootcampsId within courses

router
	.route("/")
	// .get(getCourses)
	.get(
		advancedResults(Course, {
			// copied from populate course in the coursesController
			path: "bootcamp", // show the bootcamp data
			select: "name description" // BUT ONLY NAME & DESCRIPTION
		}),
		getCourses
	)
	.post(addCourse);
router
	.route("/:id")
	.get(getCourse)
	.put(updateCourse)
	.delete(deleteCourse);

module.exports = router;
