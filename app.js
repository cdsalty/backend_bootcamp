const express = require("express");
const dotenv = require("dotenv"); // see config file
const morgan = require("morgan"); // for middleware
const colors = require("colors");
const errorHandler = require("./middleware/error");
const connectDB = require("./config/db"); // this MUST be called after the config, before the routes

// Load env variables
dotenv.config({ path: "./config/config.env" });

// Connect to Database
connectDB();

// Route Files
const bootcamps = require("./routes/bootcamps");

// initilize express
const app = express();

// Implement the Body Parser (otherwise my data is coming back undefined)
app.use(express.json());

// Dev Logging MIDDLEWARE
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
	// EXAMPLE RETURN: DELETE /api/v1/bootcamps/1 200 2.564 ms - 46
}

// Mount routers to url
app.use("/api/v1/bootcamps", bootcamps);
// Inserting error-hanlder(for errs with next())
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
	PORT,
	console.log(
		`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
			.inverse
	)
);

// Handle UNHANDLED errors such as the server running but not connecting to database  ****
process.on("unhandledRejection", (err, promise) => {
	console.log(`Error: ${err.message}`.red.bold);
	// Close Server, Exit Process and Detail Error in console
	server.close(() => process.exit(1)); // WANT MORE CLARIFICATION FO OTHER OPTIONS
});

// Example
// app.get("/", (req, res) => {
// 	// res.send("<h1>Hello World</h1>");
// 	// res.send('Hello World');
// 	// res.status(400).json({ success: false }); // to send a bad request response; success: failed --> will not work; needs to boolean.
// 	res.status(200).json({ success: true, data: { id: 1 } }); // example of what a successful response will look like
// });

// Addressing issue when getting { useUnifiedTopology: true } by creating a varaible for app.listen for getting around error
