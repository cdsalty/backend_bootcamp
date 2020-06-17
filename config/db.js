const mongoose = require("mongoose");

const connectDB = async () => {
	const connect = await mongoose.connect(process.env.MONGO_URI, {
		// the following will prevent certain errors from appearing. --to ignore the deprecation warning
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useUnifiedTopology: true,
	});
	// test
	console.log(
		`MONGO DB is connected: ${connect.connection.host}`.cyan.reset.bold
	);
};

module.exports = connectDB;

/*
____________________________________________________________________________________________________________

COVERING THE BASICS OF HOOKING UP TO MONGOOSE


when using a mongoose method, they always return a promise. 
- could use .then() but went async


Changed from...

const connectDB = () => {
  mongoose.connect()
}

to

const connectDB = async () => {
  const connect = await mongoose.connect()
}

the first thing that mongoose.connect takes is a URI (in atlas, select connect, then connect to your application, and copy the connection string
  - next, place this inside the config.env file mongodb+srv://cdsoltis:<placeactualpasswordherewithoutarrows>@soltisbootcamper-u0uqh.mongodb.net/<ICHANGEDTHENAMETOO>?retryWrites=true&w=majority
  - created the actual URI inside my config
  - propcess.env.MONGO_URI

    - it then takes
____________________________________________________________________________________________________________
*/
