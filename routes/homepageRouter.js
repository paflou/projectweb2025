var express = require("express");
var router = express.Router();
var path = require("path"); // Add this line to import the path module

router.get("/", (req, res) => {
  const role = req.session.role; // or however you store session/user info

  if (role) {
    if (role === 'professor') return res.redirect('/prof');
    if (role === 'student') return res.redirect('/student');
    if (role === 'secretary') return res.redirect('/secretary');
  }
  res.sendFile(path.join(__dirname, "../public/homepage.html"));
});

router.get('/api/current-user', (req, res) => {
  if (req.session && req.session.username) {
    res.json({ loggedIn: true, username: req.session.username, role: req.session.role });
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
    res.redirect('/');
  });
});

module.exports = router;
