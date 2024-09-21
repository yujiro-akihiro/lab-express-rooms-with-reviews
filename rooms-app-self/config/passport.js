const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User.model');
const bcrypt = require('bcrypt');

// Local strategy for username and password authentication
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, (email, password, done) => {
    User.findOne({ email }, (err, user) => {
        if (err) return done(err);
        if (!user) return done(null, false, { message: 'Incorrect email.' });

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return done(err);
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Incorrect password.' });
            }
        });
    });
}));

// // Google strategy for social login
// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "/auth/google/callback"
// }, (accessToken, refreshToken, profile, done) => {
//     User.findOne({ googleID: profile.id }, (err, existingUser) => {
//         if (err) return done(err);
//         if (existingUser) return done(null, existingUser);

//         const newUser = new User({
//             googleID: profile.id,
//             fullName: profile.displayName,
//             email: profile.emails[0].value
//         });
//         newUser.save((err) => {
//             if (err) return done(err);
//             return done(null, newUser);
//         });
//     });
// }));

// Serialize and deserialize user sessions
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

module.exports = passport;