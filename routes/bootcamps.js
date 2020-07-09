// Moved routes inside here for router
const express = require("express");
const {
	getBootcamp,
	getBootcamps,
	createBootcamp,
	updateBootcamp,
	deleteBootcamp,
	getBootcampsInRadius,
	bootcampPhotoUpload
} = require("../controllers/bootcampsController");

// bringing in model
const Bootcamp = require("../models/Bootcamp");

// bringing in middleware (will give access to 'res.advancedResults' which is what I send back to the client)
const advancedResults = require("../middleware/advancedResults");

// resourceRouter#1: To include other resource routers (goal behind the scenes is to be able to use this route with my courses)
const courseRouter = require("./courses");

const router = express.Router();

// resourceRouter#2: The actual re-route INTO other resource routers
router.use("/:bootcampId/courses", courseRouter); // pass it on to the course router rather than bringing in getCourses
// /api/v1/bootcamps will be represented as a "slash", '/'

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

// For photo upload routing
router.route("/:id/photo").put(bootcampPhotoUpload);

router
	.route("/")
	// .get(getBootcamps)
	.get(advancedResults(Bootcamp, "courses"), getBootcamps) // advancedResults takes in the 'model' and what to 'populate'
	.post(createBootcamp);

router
	.route("/:id")
	.get(getBootcamp)
	.put(updateBootcamp)
	.delete(deleteBootcamp);

module.exports = router;
