// 'function inside/within a function' that allows the functionality to be resusable.
const advancedResults = (model, populate) => async (req, res, next) => {
	// pasted from bootcampsController and then changed accordingly.
	let query;
	const reqQuery = {...req.query}; // make copy of the req.query object
	const removeFields = ["select", "sort", "page", "limit"]; // fields that will be excluded and removed from the params
	removeFields.forEach((param) => delete reqQuery[param]); // Loop over and DELETE REMOVEFIELDS FROM reqQuery.

	// Convert reqQuery to string in order to use the replace method. (for money opeator to display)
	let queryString = JSON.stringify(reqQuery);
	// Create operators($gt, $gte, $in, etc.)
	queryString = queryString.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

	// Finding resource (in regards to the virtual created inside of courses to show name and description) (** updated and changed from Bootcamp.find() to model.find())
	// query = model.find(JSON.parse(queryString)).populate("courses"); // could pass in an object to limit the fields displayed as done insided the coursesController
	query = model.find(JSON.parse(queryString)); // updated and will be populated
	if (populate) {
		query = query.populate(populate); // set the query to populate whatever is passed into the value for populate. (could be "coures" or "bootcamps, etc.")
	}

	// Select fields (this will only return the name and description of each bootcamp vs all information of the bootcamps that match.)
	if (req.query.select) {
		const fields = req.query.select.split(",").join(" ");
		// console.log(fields);
		query = query.select(fields);
	}

	// SORT (use negative number to sort by descending order) ------------------------------------
	if (req.query.sort) {
		const sortBy = req.query.sort.split(",").join(" ");
		query = query.sort(sortBy);
	} else {
		query = query.sort("-createdAt");
	}

	// PAGINATION ------------------------------------
	const page = parseInt(req.query.page, 10) || 1; // ignoring page and assigning the value as an integer; default page 1;
	const limit = parseInt(req.query.limit, 10) || 10; // default is 10 per page
	const startIndex = (page - 1) * limit; // to configure how many resources/bootcamps to skip;
	// console.log(`the starting index amount is ${startIndex}`);
	const endIndex = page * limit;
	const total = await model.countDocuments(); // mongo method... (changed from Bootcamp.countDocuments)

	query = query.skip(startIndex).limit(limit);

	// Execute the query
	const results = await query; // changed the query variable from bootcamps to results

	// Pagination Results
	const pagination = {}; // pagination object

	if (endIndex < total) {
		pagination.next = {
			page: page + 1,
			limit: limit
		};
	}

	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit
		};
	}

	// *** Creating a Response Object for reusability ***
	res.advancedResults = {
		success: true,
		count: results.length,
		pagination: pagination,
		data: results
	};

	next();
};

module.exports = advancedResults;

/*
advancedResults.js is a middleware function, which needs req, res and next but it's also taking in the model. By taking in the model, it's not limited to bootcamp such as "Bootcamp.find()... 

Example: 
query = Bootcamp.find(JSON.parse(queryStr)).populate('courses);
- what if we want to set query to Course and populate bootcamps? 
-   -   This is how!
**
After pasting in the data from the bootcamps controller, any place I used model Bootcamp, I changed it to model
- query = model.find instead of Bootcamp.find()
- const total = await Bootcamp.countDocuments(); changed to: const total = await model.countDocuments();
- const bootcamps = await query; changed to: const results = await query;

**
- then proceeded to create an object on the response object that can be used with any routes that use this middleware. 

**
- in order to use the middleware, go inside of the routes folder, to bootcamps
  - bring it in: const advancedResults = require('../middleware/advancedResults');
  - bring in the Bootcamp model: const Bootcamp = require('../models/Bootcamp')
  - anytime I want to use advancedResults, pass it in with the method to use it. It will take the model, Bootcamp, and then anything to populate which will be courses
    - such as router.get(getBootcamps) 
      - to: router.get(advancedResults(Bootcamp, 'courses'),getBootcamps) 

*/
