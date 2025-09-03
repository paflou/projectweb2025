// Import required modules
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const fs = require('fs');

// Import route handlers
var homepageRouter = require("./routes/homepageRouter");
var { router: loginRouter } = require('./routes/loginRouter');
var professorRouter = require("./routes/professor/index");
var studentRouter = require("./routes/student/index");
var secretaryRouter = require("./routes/secretary/index");

// Load environment variables from .env file
require('dotenv').config();

// Import session and session store
var MySQLStore = require("express-mysql-session")(require("express-session"));
var session = require("express-session");

var app = express();

// Ensure upload dir exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

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


app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    dotfiles: 'deny',
    index: false,
  })
);


// Export the app module
module.exports = app;
