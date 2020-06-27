const mongoose = require('mongoose');

// Create Course Schema
const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add the course title']
  },
  description: {
    type: String,
    required: [true, 'Please give a description']
  },
  weeks: {
    type: String,
    required: [true, 'Please add how many weeks are in the camp.']
  },
  tuition: {
    type: Number,
    required: [true, 'Please add the cost of tuition']
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add a minimum skill level'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // need to add bootcamp as field for it to be relational
  bootcamp: {
    type: mongoose.Schema.ObjectId, // this assist in passing the objectId that's already been assisgned
    ref: 'Bootcamp',
    required: true
  }
});

module.exports = mongoose.model('Course', CourseSchema); // the name you give it: 'Course', the schema passed to it: CourseScehma
