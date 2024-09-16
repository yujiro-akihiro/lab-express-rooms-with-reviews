const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// Sign up route
router.post('/signup', (req, res) => {
    const { email, password, fullName } = req.body; // Extract user data from request body
    const newUser = new User({ email, password, fullName }); // Create a new User instance

    newUser.save((err) => {
        if (err) return res.status(500).send('Error signing up'); // Handle sign-up errors
        res.redirect('/login'); // Redirect to login page upon successful sign-up
    });
});

// Log in route
router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard', // Redirect to dashboard on successful login
    failureRedirect: '/login', // Redirect back to login page on failure
    failureFlash: true // Enable flash messages for login failure (requires connect-flash)
}));

// Log out route
router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) return next(err); // Handle logout errors if any
        res.redirect('/'); // Redirect to homepage after successful logout
    });
});

module.exports = router;
