const express = require('express');
const {getCourses} = require('../controllers/coursesController');

const router = express.Router({mergeParams: true}); // to merge bootcampsId within courses

router.route('/').get(getCourses);

module.exports = router;
