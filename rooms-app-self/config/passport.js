const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User.model');
const bcrypt = require('bcrypt');

// Local strategy for username and password authentication
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        // Find user by email
        const user = await User.findOne({ email }); // Use async/await for findOne()
        if (!user) {
            return done(null, false, { message: 'Incorrect email.' });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password); // Use async/await for bcrypt
        if (isMatch) {
            return done(null, user); // Passwords match, proceed with authentication
        } else {
            return done(null, false, { message: 'Incorrect password.' });
        }
    } catch (err) {
        return done(err); // Handle any errors
    }
}));

// // Google strategy for social login (optional)
// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "/auth/google/callback"
// }, async (accessToken, refreshToken, profile, done) => {
//     try {
//         // Find existing user with Google ID
//         let user = await User.findOne({ googleID: profile.id });
//         if (user) {
//             return done(null, user); // User found, proceed with login
//         }

//         // Create new user if not found
//         const newUser = new User({
//             googleID: profile.id,
//             fullName: profile.displayName,
//             email: profile.emails[0].value
//         });
//         user = await newUser.save(); // Save new user
//         return done(null, user);
//     } catch (err) {
//         return done(err); // Handle any errors
//     }
// }));

// Serialize user into the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id); // Find user by ID
        done(null, user);
    } catch (err) {
        done(err);
    }
});

module.exports = passport;
