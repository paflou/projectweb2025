var express = require("express");
var router = express.Router();

const pool = require("../db/db"); // adjust the path as needed

var path = require("path");
const redirectIfLoggedIn = require("../middlewares/redirectIfLoggedIn");

/* GET login page. */
router.get("/", redirectIfLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, "../public/login.html"));
});

// POST /login handler
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await authenticateUser(email, password);
    if (user) {
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.role = user.role;
      res.redirect('/');
    } else {
      res.status(401).send('Invalid email or password');
    }
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;


function authenticateUser(email, password) {
  return new Promise((resolve, reject) => {
    pool.getConnection()
      .then(conn => {
        conn.query('SELECT * FROM user WHERE email = ? AND password = ?', [email, password])
          .then(rows => {
            conn.release();
            if (rows.length > 0) {
              resolve(rows[0]);
            } else {
              resolve(null);
            }
          })
          .catch(err => {
            conn.release();
            reject(err);
          });
      })
      .catch(err => reject(err));
  })
}