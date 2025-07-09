var express = require("express");
var router = express.Router();
const pool = require("../../db/db");
const loginRouter = require('../loginRouter');

var path = require("path");
const checkPermission = require("../../middlewares/checkPermission");

// Route: GET /student
// Serve the main student page
router.get("/", checkPermission('student'), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/student/student.html"));
});

// Route: GET /student/view_thesis
// Serve the page for viewing theses
router.get("/view_thesis", checkPermission("student"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/student/view_thesis.html"));
});

// Route: GET /student/profile
// Serve the student profile page
router.get("/profile", checkPermission("student"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/student/profile.html"));
});

// Route: GET /student/manage
// Serve the student manage page
router.get("/manage", checkPermission("student"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/student/manage.html"));
});

// Route: GET /student/get-info
// Fetch and return the student's information as JSON
router.get('/get-info', async (req, res) => {
  try {
    // Retrieve student information from the database
    const info = await getStudentInformation(req);
    if (info) {
      // Set response header to JSON and send the info
      // Convert BigInt values to strings if present
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ info }, (_, v) =>
        typeof v === 'bigint' ? v.toString() : v
      ));
    } else {
      // If no info found, send 401 error
      res.status(401).json({ error: 'Could not fetch Data' });
    }
  } catch (err) {
    // Log and send server error if something goes wrong
    console.error('Error in /get-info:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route: POST /student/get-info
// Update the student's information after authenticating the user
router.post('/get-info', async (req, res) => {
  // Destructure the fields from the request body
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

  // Prepare the data object for updating
  const data = { email, mobile, landline, street, streetNumber, city, postcode };

  try {
    // Authenticate the user using their session email and provided password
    console.log("Trying to authenticate...");
    const user = await loginRouter.authenticateUser(req.session.email, password);
    console.log("user authenticated");

    if (user) {
      // If authentication is successful, update the student information
      await updateStudentInformation(data, req.session.userId);
      res.status(200).send("Information updated");
    } else {
      // If authentication fails, send a 401 Unauthorized response
      res.status(401).send('Invalid email or password');
    }

  } catch (authErr) {
    // Handle errors during authentication
    console.error("authenticateUser threw an error:", authErr);
    res.status(500).send("Authentication error");
  }
});

// Function to update student information in the database
async function updateStudentInformation(data, userId) {
  // SQL query to update user and student tables using INNER JOIN
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
  // Prepare parameters for the SQL query
  const params = [
    data.email,
    data.mobile,
    data.landline,
    data.street,
    data.streetNumber,
    data.city,
    data.postcode,
    userId
  ];
  // Get a connection from the pool
  const conn = await pool.getConnection();
  try {
    // Execute the update query
    const rows = await conn.query(sql, params);
    conn.release();

    // Return the result if update was successful
    if (rows.length > 0) {
      return rows[0];
    } else {
      return null;
    }
  } catch (err) {
    // Release the connection and log error if something goes wrong
    conn.release();
    console.error('Error in POST /get-info:', err);
    res.status(500).send('Server error');
  }
}

// Function to fetch student information from the database
async function getStudentInformation(req) {
  // SQL query to select user and student fields by user ID
  const sql = `
    SELECT email, landline, mobile, street, street_number, postcode, city
    FROM user
    INNER JOIN student ON user.id = student.id
    WHERE user.id = ?
  `;

  // Use the userId from the session as the query parameter
  const params = [req.session.userId];
  // Get a connection from the pool
  const conn = await pool.getConnection();
  try {
    // Execute the query
    const rows = await conn.query(sql, params);
    conn.release();

    // Return the first row if found, otherwise null
    if (rows.length > 0) {
      return rows[0];
    } else {
      return null;
    }
  } catch (err) {
    // Release the connection and propagate the error
    conn.release();
    throw err;
  }
}


module.exports = router;
