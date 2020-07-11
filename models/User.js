const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Everybody has a name, what's yours?"]
	},
	email: {
		type: String,
		required: [true, "Add Email"],
		unique: true,
		match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please add a valid email"]
	},
	role: {
		type: String,
		enum: ["user", "publisher"], // must go inside mongodb to change to admin settings, such as Compass
		default: "user"
	},
	password: {
		type: String,
		required: [true, "Please add a password"],
		minlength: 6,
		select: false // when we get the user from the api, it doesn't show the password
	},
	resetPasswordToken: String,
	resetPasswordExpire: Date,
	createdAt: {
		type: Date,
		default: Date.now
	}
});

// Encrypt Passwords with BCRYPTjs
UserSchema.pre("save", async function(next) {
	// generate a 'salt' to hash the password(genSalt() is a bcrypt method that returns a promise; higher number 	is more secure; recommended is 10)
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt); // pulled out password in authController.js
});

// Sign JWT and Return: (https://jwt.io/)

module.exports = mongoose.model("User", UserSchema); // the model be will be called User
