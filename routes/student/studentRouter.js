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

// Route: GET /student/thesis-info
// Get student's thesis information and status
router.get('/thesis-info', async (req, res) => {
  try {
    const thesisInfo = await getStudentThesisInfo(req);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ thesis: thesisInfo }, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    ));
  } catch (err) {
    console.error('Error in /thesis-info:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route: GET /student/detailed-thesis-info
// Get detailed thesis information including committee members and time elapsed
router.get('/detailed-thesis-info', async (req, res) => {
  try {
    const detailedInfo = await getDetailedThesisInfo(req);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ thesis: detailedInfo }, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    ));
  } catch (err) {
    console.error('Error in /detailed-thesis-info:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route: GET /student/committee-status
// Get committee members and pending invitations
router.get('/committee-status', async (req, res) => {
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
router.get('/search-professors', async (req, res) => {
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

// Route: POST /student/invite-professor
// Send invitation to professor for committee membership
router.post('/invite-professor', async (req, res) => {
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
router.post('/upload-thesis', async (req, res) => {
  try {
    // Handle file upload using formidable (similar to professor router)
    const result = await handleThesisUpload(req);

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

// Route: POST /student/add-material-link
// Add additional material link
router.post('/add-material-link', async (req, res) => {
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
router.post('/save-exam-details', async (req, res) => {
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
router.post('/save-repository-link', async (req, res) => {
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
router.post('/cancel-pending-invitations', async (req, res) => {
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

// Function to get student's thesis information
async function getStudentThesisInfo(req) {
  const sql = `
    SELECT
      t.id,
      t.title,
      t.description,
      t.thesis_status,
      t.submission_date,
      t.pdf,
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

// Function to get detailed thesis information with committee members and time elapsed
async function getDetailedThesisInfo(req) {
  const sql = `
    SELECT
      t.id,
      t.title,
      t.description,
      t.thesis_status,
      t.submission_date,
      t.pdf,
      t.grade,
      t.member1_id,
      t.member2_id,
      u.name as supervisor_name,
      u.surname as supervisor_surname,
      p.topic as supervisor_topic,
      p.department as supervisor_department
    FROM thesis t
    INNER JOIN professor p ON t.supervisor_id = p.id
    INNER JOIN user u ON p.id = u.id
    WHERE t.student_id = ?
  `;

  const params = [req.session.userId];
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(sql, params);

    if (rows.length === 0) {
      conn.release();
      return null;
    }

    const thesis = rows[0];

    // Get committee members from both committee_invitation table and thesis table
    let committeeRows = [];

    // First, try to get from thesis table (member1_id, member2_id)
    if (thesis.member1_id || thesis.member2_id) {
      const membersSql = `
        SELECT
          u1.name as member1_name,
          u1.surname as member1_surname,
          p1.topic as member1_topic,
          p1.department as member1_department,
          u2.name as member2_name,
          u2.surname as member2_surname,
          p2.topic as member2_topic,
          p2.department as member2_department
        FROM thesis t
        LEFT JOIN professor p1 ON t.member1_id = p1.id
        LEFT JOIN user u1 ON p1.id = u1.id
        LEFT JOIN professor p2 ON t.member2_id = p2.id
        LEFT JOIN user u2 ON p2.id = u2.id
        WHERE t.id = ?
      `;

      const membersResult = await conn.query(membersSql, [thesis.id]);
      if (membersResult.length > 0) {
        const members = membersResult[0];

        // Add member1 if exists
        if (members.member1_name) {
          committeeRows.push({
            name: members.member1_name,
            surname: members.member1_surname,
            topic: members.member1_topic,
            department: members.member1_department,
            status: 'accepted'
          });
        }

        // Add member2 if exists
        if (members.member2_name) {
          committeeRows.push({
            name: members.member2_name,
            surname: members.member2_surname,
            topic: members.member2_topic,
            department: members.member2_department,
            status: 'accepted'
          });
        }
      }
    } else {
      // Fallback to committee_invitation table
      const committeeSql = `
        SELECT
          ci.status,
          u.name,
          u.surname,
          p.topic,
          p.department,
          ci.sent_at
        FROM committee_invitation ci
        INNER JOIN professor p ON ci.professor_id = p.id
        INNER JOIN user u ON p.id = u.id
        WHERE ci.thesis_id = ? AND ci.status = 'accepted'
        ORDER BY ci.sent_at ASC
      `;

      committeeRows = await conn.query(committeeSql, [thesis.id]);
    }

    // Calculate time elapsed since assignment (when thesis became 'active')
    let timeElapsed = null;
    let assignmentDate = null;

    if (thesis.thesis_status === 'active' || thesis.thesis_status === 'under-review') {
      // For active/under-review theses, find when it became active
      // This would be when the 2nd committee member accepted
      const statusSql = `
        SELECT sent_at
        FROM committee_invitation
        WHERE thesis_id = ? AND status = 'accepted'
        ORDER BY sent_at ASC
        LIMIT 1 OFFSET 1
      `;

      const statusRows = await conn.query(statusSql, [thesis.id]);
      if (statusRows.length > 0) {
        assignmentDate = statusRows[0].sent_at;
        const now = new Date();
        const assigned = new Date(assignmentDate);
        const diffTime = Math.abs(now - assigned);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        timeElapsed = diffDays;
      }
    }

    conn.release();

    return {
      ...thesis,
      committee_members: committeeRows,
      assignment_date: assignmentDate,
      time_elapsed_days: timeElapsed
    };

  } catch (err) {
    conn.release();
    throw err;
  }
}

// Function to get committee status
async function getCommitteeStatus(req) {
  // First get the thesis ID
  const thesisInfo = await getStudentThesisInfo(req);
  if (!thesisInfo) {
    return { members: [], pending: [] };
  }

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

  const params = [thesisInfo.id];
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
    const thesisInfo = await getStudentThesisInfo(req);
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

// Function to handle thesis file upload
async function handleThesisUpload(req) {
  // This would use formidable similar to professor router
  // For now, return a placeholder
  return { success: true, filename: 'thesis_draft.pdf' };
}

// Function to add material link
async function addMaterialLink(req, title, url) {
  // This would require a new table for material links
  // For now, return a placeholder
  return { success: true, linkId: 1 };
}

// Function to save examination details
async function saveExamDetails(req, examDetails) {
  const conn = await pool.getConnection();

  try {
    const thesisInfo = await getStudentThesisInfo(req);
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

// Function to save repository link
async function saveRepositoryLink(req, repositoryLink) {
  const conn = await pool.getConnection();

  try {
    const thesisInfo = await getStudentThesisInfo(req);
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
