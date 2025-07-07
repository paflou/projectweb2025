var express = require("express");
var router = express.Router();
const pool = require("../../db/db");
const loginRouter = require('../loginRouter');

var path = require("path"); // Add this line to import the path module
const checkPermission = require("../../middlewares/checkPermission");

router.get("/", checkPermission('student'), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/student/student.html"));
});

router.get("/view_thesis", checkPermission("student"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/student/view_thesis.html"));
});

router.get("/profile", checkPermission("student"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/student/profile.html"));
});

router.get("/manage", checkPermission("student"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/student/manage.html"));
});

// GET to get student information
router.get('/get-info', async (req, res) => {
  try {
    const info = await getStudentInformation(req);
    if (info) {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ info }, (_, v) =>
        typeof v === 'bigint' ? v.toString() : v
      ));
    } else {
      res.status(401).json({ error: 'Could not fetch Data' });
    }
  } catch (err) {
    console.error('Error in /get-info:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// POST updating student information
router.post('/get-info', async (req, res) => {
  const {
    email,
    mobile,
    landline,
    street,
    streetNumber,
    city,
    postcode,
    password
  } = req.body;
  const data = { email, mobile, landline, street, streetNumber, city, postcode };
  try {
    console.log("Trying to authenticate...");
    const user = await loginRouter.authenticateUser(req.session.email, password);
    console.log("user authenticated");

    if (user) {
      await updateStudentInformation(data, req.session.userId);
      res.status(200).send("Information updated");
    } else {
      res.status(401).send('Invalid email or password');
    }

  } catch (authErr) {
    console.error("authenticateUser threw an error:", authErr);
    res.status(500).send("Authentication error");
  }
});

async function updateStudentInformation(data, userId) {
  const sql = `
    UPDATE user INNER JOIN student ON user.id = student.id
    SET
    user.email = ?,
    user.mobile = ?,
    user.landline = ?,

    student.street = ?,
    student.street_number = ?,
    student.city = ?,
    student.postcode = ?
    WHERE user.id = ?
  `;
  const params = [data.email, data.mobile, data.landline, data.street, data.streetNumber, data.city, data.postcode, userId];
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(sql, params);
    conn.release();

    if (rows.length > 0) {
      return rows[0];
    } else {
      return null;
    }
  } catch (err) {
    conn.release();
    console.error('Error in POST /get-info:', err);
    res.status(500).send('Server error');
  }
}

async function getStudentInformation(req) {
  const sql = `
    SELECT email, landline, mobile, street, street_number, postcode, city
    FROM user
    INNER JOIN student ON user.id = student.id
    WHERE user.id = ?
  `;

  const params = [req.session.userId];
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(sql, params);
    conn.release();

    if (rows.length > 0) {
      return rows[0];
    } else {
      return null;
    }
  } catch (err) {
    conn.release();
    throw err;
  }
}


module.exports = router;
