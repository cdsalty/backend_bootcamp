// primary goal is to extend the core-error classes to add status codes, message, etc.

class ErrorResponse extends Error {
	// the constructor is a method that will run when we instatiate an object from the class
	// takes in two things, a message to be able to send out an error message & then a status code, to customize
	constructor(message, statusCode) {
		super(message); // this message is coming from the Error class which has it's own method properties. Will pass in my message to it.
		this.statusCode = statusCode; // for customizing the status code later
	}
}

module.exports = ErrorResponse;

// will pass in the status code to error.js
