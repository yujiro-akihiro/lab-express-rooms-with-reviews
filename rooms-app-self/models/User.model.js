const { Schema, model } = require("mongoose");
const bcrypt = require('bcrypt');

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8 // Minimum password length set to 8
    },
    fullName: {
      type: String,
      required: true
    },
    slackID: String, // Optional field for Slack login
    googleID: String // Optional field for Google login
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
    if (err) {
      console.error('Error hashing password:', err);
      return next(err);
    }

    // Set the user's password to the hashed value
    user.password = hash;

    // Move to the next middleware
    next();
  });
});

const User = model("User", userSchema);
module.exports = User;
