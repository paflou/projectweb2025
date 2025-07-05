var express = require("express");
var router = express.Router();
var path = require("path"); // Add this line to import the path module

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/homepage.html"));
});

router.get('/api/current-user', (req, res) => {
  if (req.session && req.session.username) {
    res.json({ loggedIn: true, username: req.session.username });
  } else {
    res.json({ loggedIn: false });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Logout failed');
    }
    res.clearCookie('session_cookie_name'); // use your session cookie key here
    res.sendStatus(200);
  });
});


module.exports = router;
