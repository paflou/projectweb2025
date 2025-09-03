const express = require("express");
const router = express.Router();
const loginRouter = require('../loginRouter');
const {
  getStudentInformation,
  updateStudentInformation
} = require("../../services/studentService");

// Route: GET /student/get-info
// Fetch and return the student's information as JSON
router.get('/get-info', checkPermission('student'), async (req, res) => {
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
router.post('/get-info', checkPermission('student'), async (req, res) => {
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

module.exports = router;