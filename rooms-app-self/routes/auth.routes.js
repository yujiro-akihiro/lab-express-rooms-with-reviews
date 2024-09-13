const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User')

// sign up route
router.post('/signup',(req,res) => {
    const { email, password, fullName } = req.body;
    const newUser = new User({ email, password, fullName});
})
newUser.save((err) => {
    if (err) return res.status(500).send('Error signing up');
    res.redirect('/login');
    // redirect to login page when its success
})