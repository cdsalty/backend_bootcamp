// bring in the required packages
const fs = require("fs"); // in order to bring and work with the json files that contain the data to seed
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");

// load env variables
dotenv.config({path: "./config/config.env"});

// load models(database schema)
const Bootcamp = require("./models/Bootcamp");
const Course = require("./models/Course"); // 1

// connect to database (info pulled from db.js)
mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
	useUnifiedTopology: true
});

// Read/Parse JSON files coming in (HAVE TO REMEMBER 2 DO THIS)
const bootcamps = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
);

// step 2
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, "utf-8"));

// Import Data to DB
const importData = async () => {
	try {
		// don't need to save as variable because not responding with anything; just importing to database
		await Bootcamp.create(bootcamps);
		// await Course.create(courses); // Step 3  (temporily removed, bootcamps only with no avg cost in seeder)
		console.log("Data imported...".green.inverse);
		process.exit();
	} catch (err) {
		console.error(err);
	}
};

// Delete Data From Database
const deleteData = async () => {
	try {
		// don't need to save as variable because not responding with anything; just importing to database
		await Bootcamp.deleteMany(); // will delete all when nothing is passed to deleteMany()
		await Course.deleteMany(); // step 4
		console.log("Data DELETED and DESTROYED...".red.inverse);
		// EXIT THE PROCESS
		process.exit();
		console.log("this should not run...");
	} catch (err) {
		console.error(err);
	}
};

// Function To Add or Delete Data
if (process.argv[2] === "-i") {
	// node seeder -i
	importData();
} else if (process.argv[2] === "-d") {
	// node seeder -i
	deleteData();
}

/*
Steps:
a) bring in the required packages: fs, mongoose, colors, dotenv
b) load env variables with it's location
c) load Bootcamp with it's path location
d) connect to the database
e) Read/Parse JSON files coming in using readFileSync (__dirname: "current directory location") make sure to parse the JSON
f) import data into database
h) create function to add or delete data
*/
