const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Configure the local authentication strategy
// We're using 'email' as the username field and 'password' for the password field
passport.use(new LocalStrategy({
    usernameField: 'email', // The field name in the login form for email
    passwordField: 'password' // The field name in the login form for password
}, (email, password, done) => {
    // Find the user by email in the database
    User.findOne({ email }, (err, user) => {
        if (err) return done(err); // If an error occurs, pass it to done()
        if (!user) return done(null, false, { message: 'Incorrect email.' }); // If no user is found, fail the authentication

        // Compare the provided password with the hashed password in the database
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return done(err); // If an error occurs during comparison, pass it to done()
            if (isMatch) {
                return done(null, user); // If passwords match, return the user object
            } else {
                return done(null, false, { message: 'Incorrect password.' }); // If passwords don't match, fail the authentication
            }
        });
    });
}));

// Serialize the user ID to store it in the session
passport.serializeUser((user, done) => {
    done(null, user.id); // Store only the user ID in the session
});

// Deserialize the user based on the ID stored in the session
passport.deserializeUser((id, done) => {
    // Find the user by ID when they make requests and attach it to the request object
    User.findById(id, (err, user) => {
        done(err, user); // Attach the user object to the request (req.user)
    });
});

module.exports = passport;
