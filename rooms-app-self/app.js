// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// Session management and Passport configuration
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('./config/passport'); // passport settings import

// Configure session with MongoDB to store sessions
app.use(session({
  secret: 'yourSecretKey', // The key used to encrypt the session
  resave: false,           // Don't resave session if nothing is changed
  saveUninitialized: true, // Save a session even if it is uninitialized
  store: MongoStore.create({ mongoUrl: 'mongodb://localhost/yourDB' }) // Store sessions in MongoDB
}));

// Initialize passport and manage sessions
app.use(passport.initialize());
app.use(passport.session()); // Keep the user logged in across requests

// default value for title local
const capitalize = require("./utils/capitalize");
const projectName = "rooms-app-self";

app.locals.appTitle = `${capitalize(projectName)} created with IronLauncher`;

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
app.use("/", indexRoutes);

// Authentication routes (Signup, Login, Logout)
const authRoutes = require('./routes/auth.routes');
app.use("/", authRoutes); // Use the authentication routes for user signup/login/logout

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
