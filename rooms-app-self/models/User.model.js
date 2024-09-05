/// Import required modules from Mongoose and bcrypt
const { Schema, model } = require("mongoose");
const bcrypt = require('bcrypt');

// Define the user schema with email, password, fullName, and optional social login fields
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true, // "require" should be "required"
      unique: true
    },
    password: {
      type: String,
      required: true // "require" should be "required"
    },
    fullName: {
      type: String,
      required: true // "require" should be "required"
    },
    slackID: {
      type: String // Optional field for Slack login
    },
    googleID: {
      type: String // Optional field for Google login
    }
  },
  {
    timestamps: true // Automatically add createdAt and updatedAt fields
  }
);

// Hash the password before saving the user document
userSchema.pre('save', function(next) {
  const user = this;

  // If the password has not been modified, move to the next middleware
  if (!user.isModified('password')) return next();

  // Hash the password with bcrypt and assign it to the user object
  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) return next(err);

    // Set the user's password to the hashed value
    user.password = hash;

    // Move to the next middleware
    next();
  });
});

// Create and export the User model
const User = model("User", userSchema);
module.exports = User;


