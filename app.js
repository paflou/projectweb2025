// Import required modules
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// Import route handlers
var homepageRouter = require("./routes/homepageRouter");
var { router: loginRouter } = require('./routes/loginRouter');
var professorRouter = require("./routes/professor/professorRouter");
var studentRouter = require("./routes/student/studentRouter");
var secretaryRouter = require("./routes/secretary/secretaryRouter");

// Load environment variables from .env file
require('dotenv').config();

// Import session and session store
var MySQLStore = require("express-mysql-session")(require("express-session"));
var session = require("express-session");

var app = express();

// Configure MySQL session store
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Configure session middleware
app.use(session({
  key: "session_cookie_name",
  secret: process.env.SESSION_SECRET || "default_secret",
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  }
}));

// Use logger middleware for HTTP request logging
app.use(logger("dev"));

// Parse incoming JSON requests
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: false }));

// Parse cookies
app.use(cookieParser());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Mount routers for different routes
app.use("/", homepageRouter);
app.use("/login", loginRouter);
app.use("/prof", professorRouter);
app.use("/secretary", secretaryRouter);
app.use("/student", studentRouter);

// Export the app module
module.exports = app;
