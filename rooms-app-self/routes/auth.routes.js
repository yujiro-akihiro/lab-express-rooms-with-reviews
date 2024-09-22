const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User.model');

// GET route to display the sign-up form
router.get('/signup', (req, res) => {
  res.render('signup'); // Render the signup.hbs template
});

// Sign-up POST route to handle form submission (with server-side password validation)
router.post('/signup', async (req, res) => {
  const { email, password, fullName } = req.body;

  // Server-side password validation: check if the password meets the requirements
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).send('Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, and one number.');
  }

  const newUser = new User({ email, password, fullName });

  try {
    await newUser.save(); // Save the new user without a callback (async/await)
    res.redirect('/login'); // Redirect to the login page upon successful sign-up
  } catch (err) {
    console.error("Error signing up:", err); // Log the error for debugging
    res.status(500).send('Error signing up'); // Send error response if there's an issue
  }
});

// GET route to display the login form
router.get('/login', (req, res) => {
  res.render('login'); // Render the login.hbs template
});

// Log in POST route to authenticate user using passport's local strategy
router.post('/login', passport.authenticate('local', {
  successRedirect: '/rooms', // Redirect to rooms on successful login
  failureRedirect: '/login', // Redirect to login page on failure
  failureFlash: true // Enable error messages on failure (requires connect-flash)
}));

// Log out route to log the user out and destroy session
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return next(err); // Handle any errors during logout
    res.redirect('/'); // Redirect to homepage after logout
  });
});

// Google login route (social login)
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback route after user authorizes with Google
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/rooms'); // Redirect to rooms after successful Google login
});

module.exports = router;
