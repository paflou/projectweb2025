var express = require("express");
var router = express.Router();
const pool = require("../../db/db");
const loginRouter = require('../loginRouter');
var formidable = require('formidable');
const fs = require('fs');
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
router.get("/manage", checkPermission("student"), async (req, res) => {
  try {
    const thesisInfo = await getThesisInfo(req);
    res.locals.thesisInfo = thesisInfo;
    res.sendFile(path.join(__dirname, "../../public/student/manage.html"));
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Route: GET /student/thesis-info
// Get student's thesis information and status
router.get('/thesis-info', checkPermission('student'), async (req, res) => {
  try {
    const thesisInfo = await getThesisInfo(req);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ thesis: thesisInfo }, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    ));
  } catch (err) {
    console.error('Error in /thesis-info:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route: GET /student/committee-status
// Get committee members and pending invitations
router.get('/committee-status', checkPermission('student'), async (req, res) => {
  try {
    const status = await getCommitteeStatus(req);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(status, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    ));
  } catch (err) {
    console.error('Error in /committee-status:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route: GET /student/search-professors
// Search for professors to invite to committee
router.get('/search-professors', checkPermission('student'), async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters long' });
    }

    const professors = await searchProfessors(query.trim());
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ professors }, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    ));
  } catch (err) {
    console.error('Error in /search-professors:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

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

// Route: POST /student/invite-professor
// Send invitation to professor for committee membership
router.post('/invite-professor', checkPermission('student'), async (req, res) => {
  try {
    const { professorId, message } = req.body;

    if (!professorId) {
      return res.status(400).json({ error: 'Professor ID is required' });
    }

    const result = await inviteProfessor(req, professorId, message);

    if (result.success) {
      res.status(200).json({ message: 'Invitation sent successfully' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (err) {
    console.error('Error in /invite-professor:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route: POST /student/upload-thesis
// Upload thesis file
router.post('/upload-thesis', checkPermission('student'), async (req, res) => {
  try {
    // Handle file upload using formidable
    const result = await handleThesisUpload(req, req.session.userId);

    if (result.success) {
      res.status(200).json({ message: 'Thesis uploaded successfully', filename: result.filename });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (err) {
    console.error('Error in /upload-thesis:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route: GET /student/current-thesis-file
// Get current thesis file name
router.get('/current-thesis-file', checkPermission('student'), async (req, res) => {
  try {
    const thesisInfo = await getThesisInfo(req);
    if (thesisInfo && thesisInfo.draft) {
      res.status(200).json({ filename: thesisInfo.draft });
    } else {
      res.status(404).json({ error: 'No thesis file found' });
    }
  } catch (err) {
    console.error('Error in /current-thesis-file:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

router.post('/remove-current-draft', checkPermission('student'), async (req, res) => {
  try {
    const thesisInfo = await getThesisInfo(req);
    if (thesisInfo && thesisInfo.draft) {
      const filePath = path.join(process.cwd(), 'uploads/theses', thesisInfo.draft);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
      await saveFileNameToDB(req.session.userId, null);
      res.status(200).json({ message: 'Draft removed successfully' });
    } else {
      res.status(404).json({ error: 'No draft file to remove' });
    }
  } catch (err) {
    console.error('Error in /remove-current-draft:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route: GET /student/download-thesis/:filename
// Download thesis file
router.get('/download-thesis/:filename', checkPermission('student'), async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads/theses', filename);
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (err) {
    console.error('Error in /download-thesis:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Function to handle thesis file upload
async function handleThesisUpload(req, userId) {
  const uploadDir = path.join(process.cwd(), 'uploads/theses');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const form = new formidable.IncomingForm({
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024 // 50MB
  });
  // Validate file type
  const allowedTypes = [
    'application/pdf',                                                          // PDF files
    'application/vnd.oasis.opendocument.text',                                  // ODT (OpenDocument Text)
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'   // DOCX (modern Word)
  ];

  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) return resolve({ success: false, error: 'File upload error' });

      try {
        const file = Array.isArray(files.thesis) ? files.thesis[0] : files.thesis;
        if (!file) return resolve({ success: false, error: 'No file uploaded' });

        if (!allowedTypes.includes(file.mimetype)) {
          return resolve({ success: false, error: 'Invalid file type. Only PDF, ODT, and DOCX are allowed.' });
        }

        // Generate unique filename
        const originalName = path.basename(file.originalFilename);
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${originalName}`;
        const newPath = path.join(uploadDir, uniqueName);

        // Move file
        await fs.promises.copyFile(file.filepath, newPath);
        await fs.promises.unlink(file.filepath);

        // Save filename to DB
        await saveFileNameToDB(userId, uniqueName);

        resolve({ success: true, filename: uniqueName });
      } catch (error) {
        console.error('Upload error:', error);
        resolve({ success: false, error: 'Server error during file processing' });
      }
    });
  });
}

// Save filename to DB
async function saveFileNameToDB(userId, filename) {
  const sql = `
    UPDATE thesis
    SET draft = ?
    WHERE student_id = ?
  `;
  const params = [filename, userId];

  const conn = await pool.getConnection();
  try {
    await conn.query(sql, params);
  } finally {
    conn.release();
  }
}


// Route: POST /student/add-material-link
// Add additional material link
router.post('/add-material-link', checkPermission('student'), async (req, res) => {
  try {
    const { title, url } = req.body;

    if (!title || !url) {
      return res.status(400).json({ error: 'Title and URL are required' });
    }

    const result = await addMaterialLink(req, title, url);

    if (result.success) {
      res.status(200).json({ message: 'Link added successfully', linkId: result.linkId });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (err) {
    console.error('Error in /add-material-link:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route: POST /student/save-exam-details
// Save examination details
router.post('/save-exam-details', checkPermission('student'), async (req, res) => {
  try {
    const { examDate, examTime, examType, examLocation } = req.body;

    if (!examDate || !examTime || !examType || !examLocation) {
      return res.status(400).json({ error: 'All examination details are required' });
    }

    const result = await saveExamDetails(req, { examDate, examTime, examType, examLocation });

    if (result.success) {
      res.status(200).json({ message: 'Examination details saved successfully' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (err) {
    console.error('Error in /save-exam-details:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route: POST /student/save-repository-link
// Save library repository link
router.post('/save-repository-link', checkPermission('student'), async (req, res) => {
  try {
    const { repositoryLink } = req.body;

    if (!repositoryLink) {
      return res.status(400).json({ error: 'Repository link is required' });
    }

    const result = await saveRepositoryLink(req, repositoryLink);

    if (result.success) {
      res.status(200).json({ message: 'Repository link saved successfully' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (err) {
    console.error('Error in /save-repository-link:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route: POST /student/cancel-pending-invitations
// Cancel pending invitations when thesis becomes active
router.post('/cancel-pending-invitations', checkPermission('student'), async (req, res) => {
  try {
    const thesisInfo = await getStudentThesisInfo(req);
    if (!thesisInfo) {
      return res.status(400).json({ error: 'No thesis found for student' });
    }

    const result = await cancelPendingInvitations(thesisInfo.id);

    if (result.success) {
      res.status(200).json({ message: 'Pending invitations cancelled successfully' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (err) {
    console.error('Error in /cancel-pending-invitations:', err);
    res.status(500).json({ error: 'Server Error' });
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
    throw err; // Let the route handler respond
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

// Function to get student's thesis information
async function getThesisInfo(req) {
  const sql = `
    SELECT
      t.id,
      t.title,
      t.description,
      t.thesis_status,
      t.submission_date,
      t.pdf,
      t.draft,
      t.grade,
      u.name as supervisor_name,
      u.surname as supervisor_surname
    FROM thesis t
    INNER JOIN professor p ON t.supervisor_id = p.id
    INNER JOIN user u ON p.id = u.id
    WHERE t.student_id = ?
  `;

  const params = [req.session.userId];
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(sql, params);
    conn.release();
    return rows.length > 0 ? rows[0] : null;
  } catch (err) {
    conn.release();
    throw err;
  }
}

// Function to get committee status
async function getCommitteeStatus(req) {
  const sql = `
    SELECT
      ci.id,
      ci.status,
      u.name,
      u.surname,
      p.topic,
      p.department
    FROM committee_invitation ci
    INNER JOIN professor p ON ci.professor_id = p.id
    INNER JOIN user u ON p.id = u.id
    WHERE ci.thesis_id = ?
    ORDER BY ci.sent_at DESC
  `;

  const params = [req.thesisId];
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(sql, params);
    conn.release();

    const members = rows.filter(row => row.status === 'accepted');
    const pending = rows.filter(row => row.status === 'pending');

    return { members, pending };
  } catch (err) {
    conn.release();
    throw err;
  }
}

// Function to search professors
async function searchProfessors(query) {
  const sql = `
    SELECT
      u.id,
      u.name,
      u.surname,
      p.topic,
      p.department,
      p.university
    FROM user u
    INNER JOIN professor p ON u.id = p.id
    WHERE
      u.name LIKE ? OR
      u.surname LIKE ? OR
      CONCAT(u.name, ' ', u.surname) LIKE ? OR
      p.topic LIKE ? OR
      p.department LIKE ?
    ORDER BY u.surname, u.name
    LIMIT 10
  `;

  const searchPattern = `%${query}%`;
  const params = [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern];

  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(sql, params);
    conn.release();
    return rows || [];
  } catch (err) {
    conn.release();
    throw err;
  }
}

// Function to invite professor to committee
async function inviteProfessor(req, professorId, message) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Get student's thesis
    const thesisInfo = await getThesisInfo(req);
    if (!thesisInfo) {
      await conn.rollback();
      conn.release();
      return { success: false, error: 'No thesis found for student' };
    }

    // Check if professor is already invited or is the supervisor
    const checkSql = `
      SELECT COUNT(*) as count FROM committee_invitation
      WHERE thesis_id = ? AND professor_id = ?
      UNION ALL
      SELECT COUNT(*) as count FROM thesis
      WHERE id = ? AND supervisor_id = ?
    `;
    const checkRows = await conn.query(checkSql, [thesisInfo.id, professorId, thesisInfo.id, professorId]);

    if (checkRows.some(row => row.count > 0)) {
      await conn.rollback();
      conn.release();
      return { success: false, error: 'Ο καθηγητής είναι ήδη μέρος της επιτροπής.' };
    }

    // Check if already have 2 accepted invitations
    const acceptedSql = `
      SELECT COUNT(*) as count FROM committee_invitation
      WHERE thesis_id = ? AND status = 'accepted'
    `;
    const acceptedRows = await conn.query(acceptedSql, [thesisInfo.id]);

    if (acceptedRows[0].count >= 2) {
      await conn.rollback();
      conn.release();
      return { success: false, error: 'Η επιτροπή περιέχει ήδη 3 καθηγητές' };
    }

    // Insert invitation
    const insertSql = `
      INSERT INTO committee_invitation (thesis_id, professor_id, status, sent_at)
      VALUES (?, ?, 'pending', NOW())
    `;
    await conn.query(insertSql, [thesisInfo.id, professorId]);

    await conn.commit();
    conn.release();
    return { success: true };

  } catch (err) {
    await conn.rollback();
    conn.release();
    throw err;
  }
}

// Function to add material link
async function addMaterialLink(req, title, url) {
  const conn = await pool.getConnection();

  try {
    const thesisInfo = await getThesisInfo(req);
    if (!thesisInfo) {
      conn.release();
      return { success: false, error: 'No thesis found for student' };
      return { success: true, linkId: 1 };
    }

    // Function to save examination details
    async function saveExamDetails(req, examDetails) {
      const conn = await pool.getConnection();

      try {
        const thesisInfo = await getThesisInfo(req);
        if (!thesisInfo) {
          conn.release();
          return { success: false, error: 'No thesis found for student' };
        }

        // This would require additional fields in thesis table or new table
        // For now, return success
        conn.release();
        return { success: true };

      } catch (err) {
        conn.release();
        throw err;
      }
    }
    // Insert link into additional_thesis_material table
    const insertSql = `
      INSERT INTO additional_thesis_material (thesis_id, url)
      VALUES (?, ?)
    `;
    const result = await conn.query(insertSql, [thesisInfo.id, url]);
    const linkId = result.insertId;
    conn.release();
    return { success: true, linkId };
  } catch (err) {
    conn.release();
    throw err;
  }
}

    // Function to save repository link
    async function saveRepositoryLink(req, repositoryLink) {
      const conn = await pool.getConnection();

      try {
        const thesisInfo = await getThesisInfo(req);
        if (!thesisInfo) {
          conn.release();
          return { success: false, error: 'No thesis found for student' };
        }

        // This would require additional field in thesis table
        // For now, return success
        conn.release();
        return { success: true };

      } catch (err) {
        conn.release();
        throw err;
      }
    }

    // Function to cancel pending invitations when thesis becomes active
    async function cancelPendingInvitations(thesisId) {
      const conn = await pool.getConnection();

      try {
        const cancelSql = `
      UPDATE committee_invitation
      SET status = 'cancelled'
      WHERE thesis_id = ? AND status = 'pending'
    `;
        await conn.query(cancelSql, [thesisId]);
        conn.release();
        return { success: true };

      } catch (err) {
        conn.release();
        throw err;
      }
    }


    module.exports = router;
