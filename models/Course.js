const mongoose = require("mongoose");

// Create Course Schema
const CourseSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: [true, "Please add the course title"]
	},
	description: {
		type: String,
		required: [true, "Please give a description"]
	},
	weeks: {
		type: String,
		required: [true, "Please add how many weeks are in the camp."]
	},
	tuition: {
		type: Number,
		required: [true, "Please add the cost of tuition"]
	},
	minimumSkill: {
		type: String,
		required: [true, "Please add a minimum skill level"],
		enum: ["beginner", "intermediate", "advanced"]
	},
	scholarshipAvailable: {
		type: Boolean,
		default: false
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	// need to add bootcamp as field for it to be relational (will be referred throughout)
	bootcamp: {
		type: mongoose.Schema.ObjectId, // this assist in passing the objectId that's already been assisgned AN OBJECT ID
		ref: "Bootcamp",
		required: true
	}
});

// ALL MONGODB DOCUMENTATION: https://docs.mongodb.com/manual/aggregation/
// Static Method to get average of course tuitions (the goal being to create a new object with id and average cost)
CourseSchema.statics.getAverageCost = async function(bootcampId) {
	// pass in bootcampId in order to know what bootcamp to work with
	// console.log("Calculating average cost...".blue);
	// Do the Aggregations (this.aggregate returns a promise so use await)
	const obj = await this.aggregate([
		// THIS IS THE PIPELINE (each pipeline will have different steps/operators)
		{
			$match: {bootcamp: bootcampId} // match the bootcamp,(created on line 36), to whatever the bootcamp that's passed in, which is just the bootcampId)
		},
		{
			// "group" will be the calculated object I need to create
			$group: {
				_id: "$bootcamp",
				averageCost: {$avg: "$tuition"} // the calculation along with the data point to return
			}
		}
	]);
	console.log(obj); // After verifying the averge cost is being returned, need to add/show it to the data
	try {
		await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
			averageCost: Math.ceil(obj[0].averageCost / 10) * 10
		});
	} catch (error) {
		console.log(
			error,
			"error comming from the catch of getAverageCost function in Course.js"
		);
	}
};

// Call ** getAverageCost ** AFTER ** save ***
CourseSchema.post("save", function() {
	// this is a static method, therefore run it on the actual model.
	this.constructor.getAverageCost(this.bootcamp); // bootcamp, per the model schema, is the id of the bootcamp.
});

// Call * getAverageCost ** BEFORE ** save ***
CourseSchema.pre("save", function() {
	this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model("Course", CourseSchema); // the name you give it: 'Course', the schema passed to it: CourseScehma

/*
- https://docs.mongodb.com/manual/aggregation/

- the middleware created will run a static function that's going to use aggregation(Aggregation operations process data records and return computed results.) 
  to be able to calculate the average cost.
- Aggregation operations group values from multiple documents together, and can perform a variety of operations on the grouped data to return a single result.

- post: will run after save
- pre: will run before remove (if adding or removing a course, need to make sure to reclaculate the average cost to prevent leaving in a value for a course 
  that no longer exist.)

- In mongoose you have "statics"(a static message) and "methods"
  - Statics is when you call it ON the ACTUAL Model
    - Course.goFish()

  - Methods are similar to when creating a query. (Whatever you create/get FROM the model, "on the query")
    - const courses = Course.find();
    - courses.goFish()

MongoDB Docs:
First Stage: The $match stage filters the documents by the status field and passes to the next stage those documents that have status equal to "A".
Second Stage: The $group stage groups the documents by the cust_id field to calculate the sum of the amount for each unique cust_id.

The $match stage can use an index to filter documents if it occurs at the beginning of a pipeline.
The $sort stage can use an index as long as it is not preceded by a $project, $unwind, or $group stage.
The $group stage can sometimes use an index to find the first document in each group if all of the following criteria are met:
 - The $group stage is preceded by a $sort stage that sorts the field to group by,
 - There is an index on the grouped field which matches the sort order and
 - The only accumulator used in the $group stage is $first.



*/
