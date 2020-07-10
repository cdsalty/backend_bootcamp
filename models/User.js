const mongoose = require("mongoose");

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

module.exports = mongoose.model("User", UserSchema); // the model be will be called User
