var express = require("express");
var router = express.Router();
var path = require("path");
const checkPermission = require("../../middlewares/checkPermission");
var formidable = require('formidable');
const fs = require('fs');
const pool = require("../../db/db");

// Handles thesis submission, including file upload and database insertion
function submitThesis(req, res) {
  // Create a new formidable form for parsing file uploads
  const form = new formidable.IncomingForm();
  const fsPromises = fs.promises;

  // Define the directory to store uploaded files
  const uploadDir = path.join(process.cwd(), 'uploads');
  form.keepExtensions = true;

  // Parse the incoming request containing fields and files
  form.parse(req, async (err, fields, files) => {
    /*
    if (err) {
      console.error(err);
      return res.status(500).send('Error parsing the file');
    }
    */
    // Get the uploaded PDF file (handle both array and single file cases)
    const file = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf;
    if (file) {
      // Prepare paths for moving the uploaded file
      const oldPath = file.filepath;
      const safeName = path.basename(file.originalFilename);
      const newPath = path.join(uploadDir, safeName);

      // Log thesis details for debugging
      console.log(fields.title);
      console.log(fields.summary);
      console.log(safeName);

      try {
        // Move the uploaded file to the uploads directory
        await fsPromises.copyFile(oldPath, newPath);
        await fsPromises.unlink(oldPath);
      } catch (error) {
        console.error(error);
        res.status(500).send('Error saving the file');
      }
    }
    else {
      safeName = 'NULL'
    }
    res.redirect('/prof/create');


    // SQL query to insert thesis details into the database
    const sql = `
    INSERT INTO thesis 
    (supervisor_id, member1_id, member2_id,
    student_id, title, description,
    pdf, grade)
    
    VALUES 
    (?, NULL, NULL, 
    NULL, ?, ?,
    ?, NULL) 
    `

    // Prepare query parameters
    params = [req.session.userId, fields.title, fields.summary, safeName]

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
      if (err.code === 'ER_DUP_ENTRY') {
        console.error('Duplicate entry error:', err.message);
        // Handle gracefully (e.g., send user-friendly response)
      }
      else {
        // Release the connection and propagate the error
        conn.release();
        throw err;
      }
    }
  });
}

// Function to fetch under assignment thesis' of current professor
async function getUnderAssignment(req) {
  // SQL query to select user and student fields by user ID
  const sql = `
    SELECT title, description, pdf
    FROM thesis
    WHERE supervisor_id = ? AND thesis_status = 'under-assignment'
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
      console.log(rows)
      return rows;
    } else {
      return null;
    }
  } catch (err) {
    // Release the connection and propagate the error
    conn.release();
    throw err;
  }
}


// Route: GET /professor/get-info
// Fetch and return the professors thesis' under assignment as JSON
router.get('/get-under-assignment', async (req, res) => {
  try {
    // Retrieve student information from the database
    const info = await getUnderAssignment(req);
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

// Route: POST /professor/create-topic/
// Saves a new thesis created by a professor
router.post('/create-topic', (req, res) => {
  submitThesis(req, res);
});

// Route: GET /professor/
// Serve the main professor dashboard page
router.get("/", checkPermission('professor'), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/professor/professor.html"));
});

// Route: GET /professor/create
// Serve the page for creating a new thesis
router.get("/create", checkPermission("professor"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/professor/create_thesis.html"));
});

// Route: GET /professor/assign
// Serve the page for assigning a thesis
router.get("/assign", checkPermission("professor"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/professor/assign_thesis.html"));
});

// Route: GET /professor/view_thesis
// Serve the page for viewing theses
router.get("/view_thesis", checkPermission("professor"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/professor/view_thesis.html"));
});

// Route: GET /professor/invitations
// Serve the page for viewing invitations
router.get("/invitations", checkPermission("professor"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/professor/invitations.html"));
});

// Route: GET /professor/stats
// Serve the statistics page for professors
router.get("/stats", checkPermission("professor"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/professor/statistics.html"));
});

// Route: GET /professor/manage
// Serve the page for managing professor-related data
router.get("/manage", checkPermission("professor"), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/professor/manage.html"));
});

// Export the router to be used in the main app
module.exports = router; 
