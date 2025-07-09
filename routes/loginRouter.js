var express = require("express");
var router = express.Router();
const pool = require("../db/db");

var path = require("path");
const redirectIfLoggedIn = require("../middlewares/redirectIfLoggedIn");

// GET /login page handler
// If user is already logged in, redirect them (middleware)
// Otherwise, serve the login HTML page
router.get("/", redirectIfLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

// POST /login handler
// Authenticates user credentials and starts a session if valid
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Attempt to authenticate the user
    const user = await authenticateUser(email, password);
    if (user) {
      // Store user info in session
      req.session.userId = user.id;
      req.session.email = user.email;
      req.session.username = user.username;
      req.session.role = user.role;
      res.redirect('/'); // Redirect to home page on success
    } else {
      res.status(401).send('Invalid email or password'); // Invalid credentials
    }
  } catch (err) {
    res.status(500).send('Server error'); // Internal server error
  }
});

// Authenticate user by checking email and password in the database
function authenticateUser(email, password) {
  return new Promise((resolve, reject) => {
    pool.getConnection()
      .then(conn => {
        // Query user table for matching email and password
        conn.query('SELECT * FROM user WHERE email = ? AND password = ?', [email, password])
          .then(rows => {
            conn.release();
            if (rows.length > 0) {
              resolve(rows[0]); // User found
            } else {
              resolve(null); // No user found
            }
          })
          .catch(err => {
            conn.release();
            reject(err); // Query error
          });
      })
      .catch(err => reject(err)); // Connection error
  })
}

// Export router and authenticateUser function
module.exports = {
  router,
  authenticateUser
};