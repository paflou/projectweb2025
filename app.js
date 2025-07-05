var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var homepageRouter = require("./routers/homepageRouter");
var usersRouter = require("./routers/userRouter");
var loginRouter = require("./routers/loginRouter");

require('dotenv').config();

var MySQLStore = require("express-mysql-session")(require("express-session"));
var session = require("express-session");

var app = express();

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

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

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

app.use("/", homepageRouter);
app.use("/login", loginRouter);
app.use("/users", usersRouter);

module.exports = app;
