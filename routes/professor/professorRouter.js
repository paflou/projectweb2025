var express = require("express");
var router = express.Router();
var path = require("path");
const checkPermission = require("../../middlewares/checkPermission");
var formidable = require('formidable');
const fs = require('fs');
const pool = require("../../db/db");

async function insertThesisToDB(req, res, fields, safeName) {
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
    `;

  // Prepare query parameters
  params = [req.session.userId, fields.title, fields.summary, safeName]

  // Get a connection from the pool
  const conn = await pool.getConnection();
  try {
    // Execute the query
    const rows = await conn.query(sql, params);
    conn.release();
    res.status(200).send("Thesis submitted successfully")

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
      return res.status(409).send("Thesis already exists")

    }
    else {
      // Release the connection and propagate the error
      conn.release();
      throw err;
    }
  }
}

async function updateThesis(req, res, fields, safeName) {
  let sql = null;
  console.log(safeName)
  // SQL query to insert thesis details into the database
  if (safeName !== 'NULL') {
    sql = `
    UPDATE thesis SET
    title = ?,
    description = ?,
    pdf = ?
    WHERE id = ? AND supervisor_id = ?
    `;
    params = [fields.title, fields.summary, safeName, fields.id, req.session.userId]

  }
  else {
    sql = `
    UPDATE thesis SET
    title = ?,
    description = ?
    WHERE id = ? AND supervisor_id = ?
    `;
    params = [fields.title, fields.summary, fields.id, req.session.userId]

  }

  // Prepare query parameters

  // Log the SQL query and parameters for debugging
  console.log("Update Thesis SQL Query:", sql);
  console.log("Update Thesis Params:", params);


  // Get a connection from the pool
  const conn = await pool.getConnection();
  try {
    // Execute the query
    const rows = await conn.query(sql, params);
    conn.release();
    res.status(200).send("Thesis updated successfully")

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
      return res.status(409).send("Thesis already exists")
    }
    else {
      // Release the connection and propagate the error
      conn.release();
      throw err;
    }
  }
}

// Handles thesis submission, including file upload and database insertion
function submitThesis(req, res, action) {
  // Create a new formidable form for parsing file uploads
  const form = new formidable.IncomingForm();
  const fsPromises = fs.promises;

  // Define the directory to store uploaded files
  const uploadDir = path.join(process.cwd(), 'uploads/theses_descriptions');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  form.keepExtensions = true;

  // Parse the incoming request containing fields and files
  form.parse(req, async (err, fields, files) => {
    let safeName;
    // Get the uploaded PDF file (handle both array and single file cases)
    const file = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf;
    if (file) {
      // Prepare paths for moving the uploaded file
      const oldPath = file.filepath;
      safeName = path.basename(file.originalFilename);
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
    if (action === 'insert')
      insertThesisToDB(req, res, fields, safeName);
    else if (action === 'update')
      updateThesis(req, res, fields, safeName);

  });
}

// Function to fetch under assignment thesis' of current professor
async function getUnderAssignment(req) {
  // SQL query to select user and student fields by user ID
  const sql = `
    SELECT id, title, description, pdf
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

// Function to fetch relevant thesis' of current professor
async function getRelevantThesis(req) {
  // SQL query to select thesis where professor is supervisor or committee member
  const sql = `
  SELECT
      t.id,
      t.title,
      t.description,
      t.pdf,
      t.thesis_status AS status,
      CONCAT(s.name, ' ', s.surname) AS student_name,
      CONCAT(p.name, ' ', p.surname) AS supervisor_name,
      CONCAT(c1.name, ' ', c1.surname) AS member1_name,
      CONCAT(c2.name, ' ', c2.surname) AS member2_name,
      CASE
          WHEN t.supervisor_id = ? THEN 'supervisor'
          WHEN t.member1_id = ? OR member2_id = ? THEN 'committee'
          WHEN t.student_id = ? THEN 'student'
          ELSE 'unknown'
      END AS user_role
  FROM thesis AS t
  LEFT JOIN user AS s ON t.student_id = s.id
  LEFT JOIN user AS c1 ON t.member1_id = c1.id
  LEFT JOIN user AS c2 ON t.member2_id = c2.id
  LEFT JOIN user AS p ON t.supervisor_id = p.id
  WHERE ? IN (supervisor_id, member1_id, member2_id, student_id);
  `;

  // Use the userId from the session as the query parameter
  const params = [req.session.userId, req.session.userId, req.session.userId, req.session.userId, req.session.userId];
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

// Route: GET /professor/get-relevant-thesis
// Fetch and return the thesis the professor is supervising or is committee member of
router.get('/get-relevant-thesis',checkPermission('professor'), async (req, res) => {
  try {
    // Retrieve student information from the database
    const info = await getRelevantThesis(req);
    if (info) {
      // Set response header to JSON and send the info
      // Convert BigInt values to strings if present
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ info }, (_, v) =>
        typeof v === 'bigint' ? v.toString() : v
      ));
    } else {
      // If no info found, send 200 with empty array
      res.status(200).json({ info: [] });
    }
  } catch (err) {
    // Log and send server error if something goes wrong
    console.error('Error in /get-info:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Function to delete a thesis by ID
// Only the professor who created the thesis can delete it
router.delete('/delete-topic',checkPermission('professor'), async (req, res) => {
  const sql = `
    DELETE FROM thesis
    WHERE id = ? AND supervisor_id = ?
  `;

  // Use the thesis ID from the request body as the query parameter
  const params = [req.body.id, req.session.userId];

  console.log("QUERY: " + sql)
  console.log("ID: " + params)

  // Get a connection from the pool
  const conn = await pool.getConnection();
  try {
    // Execute the delete query
    const rows = await conn.query(sql, params);
    conn.release();

    // If rows affected is greater than 0, deletion was successful
    if (rows.affectedRows > 0) {
      res.status(200).send("Thesis deleted successfully");
    } else {
      res.status(404).send("Thesis not found");
    }
  } catch (err) {
    // Release the connection and log error if something goes wrong
    conn.release();
    console.error('Error in DELETE /delete-topic:', err);
    res.status(500).send('Server error');
  }
}
);

// Route: GET /professor/get-info
// Fetch and return the professors thesis' under assignment as JSON
router.get('/get-under-assignment',checkPermission('professor'), async (req, res) => {
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
router.post('/create-topic',checkPermission('professor'), (req, res) => {
  submitThesis(req, res, 'insert');
});

router.post('/update-topic',checkPermission('professor'), (req, res) => {
  submitThesis(req, res, 'update');
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

// Route: GET /professor/search-students
// Search for students by student number or name
router.get('/search-students',checkPermission('professor'), async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters long' });
    }

    const students = await searchStudents(query.trim());
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ students }, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    ));
  } catch (err) {
    console.error('Error in /search-students:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route: GET /professor/available-topics
// Get available thesis topics for assignment
router.get('/available-topics',checkPermission('professor'), async (req, res) => {
  try {
    const topics = await getAvailableTopics(req);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ topics }, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    ));
  } catch (err) {
    console.error('Error in /available-topics:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route: GET /professor/temporary-assignments
// Get temporary assignments awaiting committee approval
router.get('/temporary-assignments',checkPermission('professor'), async (req, res) => {
  try {
    const assignments = await getTemporaryAssignments(req);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ assignments }, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    ));
  } catch (err) {
    console.error('Error in /temporary-assignments:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route: POST /professor/assign-thesis
// Assign a thesis to a student
router.post('/assign-thesis',checkPermission('professor'), async (req, res) => {
  try {
    const { thesisId, studentId } = req.body;

    if (!thesisId || !studentId) {
      return res.status(400).json({ error: 'Thesis ID and Student ID are required' });
    }

    const result = await assignThesisToStudent(req, thesisId, studentId);

    if (result.success) {
      res.status(200).json({ message: 'Thesis assigned successfully' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (err) {
    console.error('Error in /assign-thesis:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route: POST /professor/cancel-assignment
// Cancel a thesis assignment by removing student_id
router.post('/cancel-assignment', checkPermission('professor'), async (req, res) => {
  try {
    const { thesisId } = req.body;

    if (!thesisId) {
      return res.status(400).json({ error: 'Thesis ID is required' });
    }

    const result = await cancelThesisAssignment(req, thesisId);

    if (result.success) {
      res.status(200).json({ message: 'Assignment cancelled successfully' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (err) {
    console.error('Error in /cancel-assignment:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route: GET /professor/get-invitations
// Get committee invitations for the professor
router.get('/get-invitations', checkPermission('professor'), async (req, res) => {
  try {
    const invitations = await getProfessorInvitations(req);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ invitations }, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    ));
  } catch (err) {
    console.error('Error in /get-invitations:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route: POST /professor/accept-invitation
// Accept a committee invitation
router.post('/accept-invitation',checkPermission('professor'), async (req, res) => {
  try {
    const { invitationId } = req.body;

    if (!invitationId) {
      return res.status(400).json({ error: 'Invitation ID is required' });
    }

    const result = await acceptInvitation(req, invitationId);

    if (result.success) {
      res.status(200).json({ message: 'Invitation accepted successfully' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (err) {
    console.error('Error in /accept-invitation:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route: POST /professor/reject-invitation
// Reject a committee invitation
router.post('/reject-invitation',checkPermission('professor'), async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const { invitationId } = req.body;

    if (!invitationId) {
      return res.status(400).json({ error: 'Invitation ID is required' });
    }

    const result = await rejectInvitation(req, invitationId, conn);

    if (result.success) {
      res.status(200).json({ message: 'Invitation rejected successfully' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (err) {
    console.error('Error in /reject-invitation:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route: POST /professor/leave-comittee
// Leave a committee for a thesis
router.post('/leave-comittee', checkPermission('professor'), async (req, res) => {
  try {
    const { thesisId, invitationId } = req.body;

    if (!thesisId) {
      return res.status(400).json({ error: 'thesis ID is required' });
    }

    const result = await leaveComittee(req, thesisId, invitationId);

    if (result.success) {
      res.status(200).json({ message: 'Left the comittee successfully' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (err) {
    console.error('Error in /leave-comittee', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Function to search for students by student number or name (only students without thesis)
async function searchStudents(query) {
  const sql = `
    SELECT
      user.id,
      user.name,
      user.surname,
      user.email,
      student.student_number
    FROM user
    INNER JOIN student ON user.id = student.id
    LEFT JOIN thesis ON student.id = thesis.student_id
    WHERE
      thesis.student_id IS NULL
      AND (
        student.student_number LIKE ? OR
        user.name LIKE ? OR
        user.surname LIKE ? OR
        CONCAT(user.name, ' ', user.surname) LIKE ?
      )
    ORDER BY student.student_number
    LIMIT 10
  `;

  const searchPattern = `%${query}%`;
  const params = [searchPattern, searchPattern, searchPattern, searchPattern];

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

// Function to get available thesis topics for assignment
async function getAvailableTopics(req) {
  const sql = `
    SELECT
      id,
      title,
      description,
      pdf,
      submission_date
    FROM thesis
    WHERE supervisor_id = ? AND thesis_status = 'under-assignment' AND student_id IS NULL
    ORDER BY submission_date DESC
  `;

  const params = [req.session.userId];

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

// Function to get temporary assignments awaiting committee approval
async function getTemporaryAssignments(req) {
  const sql = `
    SELECT
      t.id,
      t.title,
      t.description,
      t.submission_date,
      u.name as student_name,
      u.surname as student_surname,
      s.student_number,
      COALESCE(ci.pending_invitations, 0) as pending_invitations,
      COALESCE(ci.accepted_invitations, 0) as accepted_invitations
    FROM thesis t
    INNER JOIN student s ON t.student_id = s.id
    INNER JOIN user u ON s.id = u.id
    LEFT JOIN (
      SELECT
        thesis_id,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_invitations,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted_invitations
      FROM committee_invitation
      GROUP BY thesis_id
    ) ci ON t.id = ci.thesis_id
    WHERE t.supervisor_id = ?
      AND t.thesis_status = 'under-assignment'
      AND t.student_id IS NOT NULL
      AND COALESCE(ci.accepted_invitations, 0) < 2
    ORDER BY t.submission_date DESC
  `;

  const params = [req.session.userId];

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

// Function to assign a thesis to a student
async function assignThesisToStudent(req, thesisId, studentId) {
  const conn = await pool.getConnection();

  try {
    // Start transaction
    await conn.beginTransaction();

    // First, verify that the thesis belongs to the current professor and is available
    const checkThesisSql = `
      SELECT id, title, student_id
      FROM thesis
      WHERE id = ? AND supervisor_id = ? AND thesis_status = 'under-assignment'
    `;
    const thesisRows = await conn.query(checkThesisSql, [thesisId, req.session.userId]);

    if (thesisRows.length === 0) {
      await conn.rollback();
      conn.release();
      return { success: false, error: 'Thesis not found or not available for assignment' };
    }

    // Check if thesis is already assigned
    if (thesisRows[0].student_id !== null) {
      await conn.rollback();
      conn.release();
      return { success: false, error: 'Thesis is already assigned to another student' };
    }

    // Update the thesis with the student ID
    const updateSql = `
      UPDATE thesis
      SET student_id = ?
      WHERE id = ? AND supervisor_id = ?
    `;
    const updateResult = await conn.query(updateSql, [studentId, thesisId, req.session.userId]);

    if (updateResult.affectedRows === 0) {
      await conn.rollback();
      conn.release();
      return { success: false, error: 'Failed to assign thesis' };
    }

    // Commit transaction
    await conn.commit();
    conn.release();

    return { success: true };

  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('Error in assignThesisToStudent:', err);
    throw err;
  }
}

async function cancelThesisAssignment(req, thesisId) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const checkThesisSql = `
      SELECT id, title, student_id
      FROM thesis
      WHERE id = ? AND supervisor_id = ? AND thesis_status = 'under-assignment'
    `;
    const thesisRow = await conn.query(checkThesisSql, [thesisId, req.session.userId]);
    console.log('DEBUG checkThesisSql result:', thesisRow);

    if (!thesisRow) {
      await conn.rollback();
      conn.release();
      return { success: false, error: 'Thesis not found or not available for cancellation' };
    }

    if (thesisRow.student_id === null) {
      await conn.rollback();
      conn.release();
      return { success: false, error: 'Thesis is not currently assigned to any student' };
    }

    const deleteInvitationsSql = `
      DELETE FROM committee_invitation
      WHERE thesis_id = ?
    `;
    await conn.query(deleteInvitationsSql, [thesisId]);

    const updateSql = `
      UPDATE thesis
      SET 
        student_id = NULL,
        member1_id = NULL,
        member2_id = NULL,
        thesis_status = 'under-assignment'
      WHERE id = ? AND supervisor_id = ?
    `;
    const updateResult = await conn.query(updateSql, [thesisId, req.session.userId]);

    if (!updateResult || updateResult.affectedRows === 0) {
      await conn.rollback();
      conn.release();
      return { success: false, error: 'Failed to cancel assignment' };
    }

    await conn.commit();
    conn.release();

    return { success: true };

  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('Error in cancelThesisAssignment:', err);
    throw err;
  }
}

// Function to get professor invitations
async function getProfessorInvitations(req) {
  const sql = `
    SELECT
      ci.id,
      ci.status,
      ci.sent_at as invitation_date,
      t.id as thesis_id,
      t.title as thesis_title,
      t.description as thesis_description,
      u.name as student_name,
      u.surname as student_surname,
      s.student_number,
      supervisor.name as supervisor_name,
      supervisor.surname as supervisor_surname
    FROM committee_invitation ci
    INNER JOIN thesis t ON ci.thesis_id = t.id
    INNER JOIN student s ON t.student_id = s.id
    INNER JOIN user u ON s.id = u.id
    INNER JOIN user supervisor ON t.supervisor_id = supervisor.id
    WHERE ci.professor_id = ?
    ORDER BY ci.sent_at DESC
  `;

  const params = [req.session.userId];

  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(sql, params);
    console.log(rows);
    conn.release();
    return rows || [];
  } catch (err) {
    conn.release();
    throw err;
  }
}

// Function to accept an invitation
async function acceptInvitation(req, invitationId) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // First, verify that the invitation belongs to the current professor and is pending
    const checkInvitationSql = `
      SELECT id, thesis_id, status
      FROM committee_invitation
      WHERE id = ? AND professor_id = ? AND status = 'pending'
    `;
    const invitationRows = await conn.query(checkInvitationSql, [invitationId, req.session.userId]);

    if (invitationRows.length === 0) {
      await conn.rollback();
      conn.release();
      return { success: false, error: 'Invitation not found or not available for acceptance' };
    }

    const thesisId = invitationRows[0].thesis_id;

    // Check if the thesis already has 2 accepted committee members
    const acceptedCountSql = `
      SELECT COUNT(*) as count
      FROM committee_invitation
      WHERE thesis_id = ? AND status = 'accepted'
    `;
    const countRows = await conn.query(acceptedCountSql, [thesisId]);

    if (countRows[0].count >= 2) {
      await conn.rollback();
      conn.release();
      return { success: false, error: 'This thesis already has the maximum number of committee members' };
    }

    // Update the invitation status to accepted
    const updateSql = `
      UPDATE committee_invitation
      SET status = 'accepted'
      WHERE id = ? AND professor_id = ?
    `;
    const updateResult = await conn.query(updateSql, [invitationId, req.session.userId]);

    if (updateResult.affectedRows === 0) {
      await conn.rollback();
      conn.release();
      return { success: false, error: 'Failed to accept invitation' };
    }

    // Update the thesis table to fill member1_id or member2_id
    const checkThesisMembersSql = `
      SELECT member1_id, member2_id
      FROM thesis
      WHERE id = ?
    `;
    const thesisRows = await conn.query(checkThesisMembersSql, [thesisId]);

    if (thesisRows.length > 0) {
      const thesis = thesisRows[0];
      let updateThesisSql;

      if (thesis.member1_id === null) {
        // Fill member1_id if it's null
        updateThesisSql = `
          UPDATE thesis
          SET member1_id = ?
          WHERE id = ?
        `;
        await conn.query(updateThesisSql, [req.session.userId, thesisId]);
        console.log(`Set member1_id to ${req.session.userId} for thesis ${thesisId}`);
      } else if (thesis.member2_id === null) {
        // Fill member2_id if member1_id is filled but member2_id is null
        updateThesisSql = `
          UPDATE thesis
          SET member2_id = ?
          WHERE id = ?
        `;
        await conn.query(updateThesisSql, [req.session.userId, thesisId]);
        console.log(`Set member2_id to ${req.session.userId} for thesis ${thesisId}`);
      }
    }

    // Check if this acceptance makes it the second accepted member
    const newAcceptedCountSql = `
      SELECT COUNT(*) as count
      FROM committee_invitation
      WHERE thesis_id = ? AND status = 'accepted'
    `;
    const newCountRows = await conn.query(newAcceptedCountSql, [thesisId]);

    // If we now have 2 accepted members, cancel all other pending invitations for this thesis
    if (newCountRows[0].count >= 2) {
      const cancelPendingSql = `
        UPDATE committee_invitation
        SET status = 'rejected'
        WHERE thesis_id = ? AND status = 'pending'
      `;
      await conn.query(cancelPendingSql, [thesisId]);

      console.log(`Cancelled all pending invitations for thesis ${thesisId} as it now has 2 accepted committee members`);
    }

    await conn.commit();
    conn.release();
    return { success: true };

  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('Error in acceptInvitation:', err);
    throw err;
  }
}

// Function to reject an invitation
async function rejectInvitation(req, invitationId, conn) {
  try {
    console.log('DEBUG: Starting rejectInvitation for invitationId:', invitationId, 'professorId:', req.session.userId);

    await conn.beginTransaction();

    // First, verify that the invitation belongs to the current professor and get thesis_id
    const checkInvitationSql = `
      SELECT id, thesis_id, status
      FROM committee_invitation
      WHERE id = ? AND professor_id = ? AND status IN ('pending', 'accepted')
    `;
    console.log('DEBUG: checkInvitationSql:', checkInvitationSql);
    const invitationRows = await conn.query(checkInvitationSql, [invitationId, req.session.userId]);
    console.log('DEBUG: checkInvitationSql result:', invitationRows);

    if (invitationRows.length === 0) {
      console.log('DEBUG: No invitation found or not available for rejection');
      await conn.rollback();
      conn.release();
      return { success: false, error: 'Invitation not found or not available for rejection' };
    }

    const thesisId = invitationRows[0].thesis_id;
    const currentStatus = invitationRows[0].status;
    console.log('DEBUG: Found invitation for thesisId:', thesisId, 'currentStatus:', currentStatus);

    // Update the invitation status to rejected
    const updateSql = `
      UPDATE committee_invitation
      SET status = 'rejected'
      WHERE id = ? AND professor_id = ?
    `;
    console.log('DEBUG: updateSql:', updateSql);
    const updateResult = await conn.query(updateSql, [invitationId, req.session.userId]);
    console.log('DEBUG: updateResult:', updateResult);

    if (updateResult.affectedRows === 0) {
      console.log('DEBUG: Failed to reject invitation');
      await conn.rollback();
      conn.release();
      return { success: false, error: 'Failed to reject invitation' };
    }

    await conn.commit();
    conn.release();
    console.log('DEBUG: Invitation rejected successfully');
    return { success: true };

  } catch (err) {
    console.error('Error in rejectInvitation:', err);
    await conn.rollback();
    conn.release();
    throw err;
  }
}

// Function to remove the professor from the comittee
async function leaveComittee(req, thesisId, invitationId) {
  const conn = await pool.getConnection();
  console.log('DEBUG: Leaving comittee for thesisId', thesisId, 'by professorId', req.session.userId);
  try {
    await conn.beginTransaction();

    const removeProfessorSql = `
      UPDATE thesis
      SET 
          member1_id = CASE WHEN member1_id = ? THEN NULL ELSE member1_id END,
          member2_id = CASE WHEN member2_id = ? THEN NULL ELSE member2_id END,
          supervisor_id = CASE WHEN supervisor_id = ? THEN NULL ELSE supervisor_id END
      WHERE id = ?
      AND (? IN (member1_id, member2_id, supervisor_id))
    `;

    const params = [
      req.session.userId, // CASE member1_id
      req.session.userId, // CASE member2_id
      req.session.userId, // CASE supervisor_id
      thesisId,           // WHERE id
      req.session.userId  // ensure professor is in comittee
    ];
    console.log('DEBUG: SQL Query:', removeProfessorSql);
    console.log('DEBUG: Params:', params);
    const result = await conn.execute(removeProfessorSql, params);
    console.log('DEBUG result:', result);

    await conn.commit();

    if (result.affectedRows === 0) {
      return { success: false, error: 'You are not part of this thesis comittee.' };
    }

    // Also reject the corresponding invitation
    await rejectInvitation(req, invitationId, conn);
    conn.release();

    return { success: true };

  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('Error in leaveComittee:', err);
    throw err;
  }
}

// Export the router to be used in the main app
module.exports = router;
