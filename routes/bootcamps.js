// Moved routes inside here for router
const express = require('express');
const {
  getBootcamp,
  getBootcamps,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius
} = require('../controllers/bootcampsController');

// resourceRouter#1: To include other resource routers (goal behind the scenes is to be able to use this route with my courses)
const courseRouter = require('./courses');

const router = express.Router();

// resourceRouter#2: The actual re-route INTO other resource routers
router.use('/:bootcampId/courses', courseRouter); // pass it on to the course router rather than bringing in getCourses

// /api/v1/bootcamps will be represented as a "slash", '/'

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router
  .route('/')
  .get(getBootcamps)
  .post(createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

module.exports = router;
