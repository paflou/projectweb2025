var express = require("express");
var router = express.Router();
var path = require("path"); // Import the path module for file path operations

// Route for the homepage
router.get("/", (req, res) => {
  const role = req.session.role; // Retrieve user role from session

  // Redirect user based on their role
  if (role) {
    if (role === 'professor') return res.redirect('/prof');
    if (role === 'student') return res.redirect('/student');
    if (role === 'secretary') return res.redirect('/secretary');
  }
  // If no role, send the homepage HTML file
  res.sendFile(path.join(__dirname, "../public/homepage.html"));
});

// API endpoint to get current user info
router.get('/api/current-user', (req, res) => {
  if (req.session && req.session.username) {
    // User is logged in, send username and role
    res.json({ loggedIn: true, username: req.session.username, role: req.session.role });
  } else {
    // User is not logged in
    res.json({ loggedIn: false });
  }
});

// Route to handle user logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      // Handle error during logout
      console.error('Logout error:', err);
      return res.status(500).send('Logout failed');
    }
    // Clear the session cookie and redirect to homepage
    res.clearCookie('session_cookie_name');
    res.redirect('/');
  });
});

module.exports = router;
