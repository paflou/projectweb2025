var express = require("express");
var router = express.Router();
var path = require("path"); // Import the path module for file path operations
const pool = require("../db/db"); // Import database connection pool
const fs = require('fs');
const checkPermission = require("../middlewares/checkPermission");
// Service function to get thesis presentations with date filtering
async function getThesisPresentations(startDate, endDate) {
  let sql = `
SELECT
    ta.id AS announcement_id,
    
    u_student.name AS student_name,
    u_student.surname AS student_surname,
    
    u_supervisor.name AS supervisor_name,
    u_supervisor.surname AS supervisor_surname,
    
    u_member1.name AS member1_name,
    u_member1.surname AS member1_surname,
    
    u_member2.name AS member2_name,
    u_member2.surname AS member2_surname,
    
    t.title AS thesis_title,
    t.exam_datetime,
    t.exam_mode,
    t.exam_location,
    
    ta.announcement_text,
    ta.created_at AS announcement_created_at

FROM thesis_announcement ta
INNER JOIN thesis t ON ta.thesis_id = t.id

INNER  JOIN user u_student ON t.student_id = u_student.id AND u_student.role = 'student'
INNER  JOIN user u_supervisor ON t.supervisor_id = u_supervisor.id AND u_supervisor.role = 'professor'
INNER  JOIN user u_member1 ON t.member1_id = u_member1.id AND u_member1.role = 'professor'
INNER  JOIN user u_member2 ON t.member2_id = u_member2.id AND u_member2.role = 'professor'

  `;

  const params = [];

  if (startDate && endDate) {
    sql += ` WHERE DATE(t.exam_datetime) BETWEEN ? AND ?`;
    params.push(startDate, endDate);
  } else if (startDate) {
    sql += ` WHERE DATE(t.exam_datetime) >= ?`;
    params.push(startDate);
  } else if (endDate) {
    sql += ` WHERE DATE(t.exam_datetime) <= ?`;
    params.push(endDate);
  }

  sql += ` ORDER BY t.exam_datetime ASC`;

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

// Route for the homepage
router.get("/", (req, res) => {
  const role = req.session.role; // Retrieve user role from session

  // Redirect user based on their role
  if (role) {
    if (role === 'professor') return res.redirect('/prof');
    if (role === 'student') return res.redirect('/student');
    if (role === 'secretary') return res.redirect('/secretary');
  }
  // If no role, send the homepage HTML file
  res.sendFile(path.join(__dirname, "../public/homepage.html"));
});

// API endpoint to get current user info
router.get('/api/current-user', (req, res) => {
  if (req.session && req.session.username) {
    // User is logged in, send username and role
    res.json({ loggedIn: true, username: req.session.username, role: req.session.role });
  } else {
    // User is not logged in
    res.json({ loggedIn: false });
  }
});

// Route to handle user logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      // Handle error during logout
      console.error('Logout error:', err);
      return res.status(500).send('Logout failed');
    }
    // Clear the session cookie and redirect to homepage
    res.clearCookie('session_cookie_name');
    res.redirect('/');
  });
});

// Public API endpoint for thesis presentations (no authentication required)
router.get('/api/presentations', async (req, res) => {
  try {
    const { start_date, end_date, format = 'json' } = req.query;

    // Validate date format if provided
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (start_date && !dateRegex.test(start_date)) {
      return res.status(400).json({ error: 'Invalid start_date format. Use YYYY-MM-DD' });
    }
    if (end_date && !dateRegex.test(end_date)) {
      return res.status(400).json({ error: 'Invalid end_date format. Use YYYY-MM-DD' });
    }

    const presentations = await getThesisPresentations(start_date, end_date);

    if (format.toLowerCase() === 'xml') {
      // Generate XML response
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<presentations>\n';

      presentations.forEach(presentation => {
        xml += '  <presentation>\n';
        xml += `    <id>${presentation.id}</id>\n`;
        xml += `    <title><![CDATA[${presentation.title}]]></title>\n`;
        xml += `    <description><![CDATA[${presentation.description || ''}]]></description>\n`;
        xml += `    <exam_datetime>${presentation.exam_datetime}</exam_datetime>\n`;
        xml += `    <exam_mode>${presentation.exam_mode || ''}</exam_mode>\n`;
        xml += `    <exam_location><![CDATA[${presentation.exam_location || ''}]]></exam_location>\n`;
        xml += `    <student_name><![CDATA[${presentation.student_name}]]></student_name>\n`;
        xml += `    <supervisor_name><![CDATA[${presentation.supervisor_name}]]></supervisor_name>\n`;
        xml += `    <member1_name><![CDATA[${presentation.member1_name || ''}]]></member1_name>\n`;
        xml += `    <member2_name><![CDATA[${presentation.member2_name || ''}]]></member2_name>\n`;
        xml += `    <supervisor_department><![CDATA[${presentation.supervisor_department}]]></supervisor_department>\n`;
        xml += '  </presentation>\n';
      });

      xml += '</presentations>';

      res.setHeader('Content-Type', 'application/xml');
      res.send(xml);
    } else {
      // Default JSON response
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({
        presentations,
        count: presentations.length,
        date_range: {
          start_date: start_date || null,
          end_date: end_date || null
        }
      }, (_, v) => typeof v === 'bigint' ? v.toString() : v));
    }
  } catch (err) {
    console.error('Error in /api/presentations:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route to serve thesis report PDF
router.get('/thesis/report/:thesisId', async (req, res) => {
  const { thesisId } = req.params;
  const userId = req.session.userId;

  try {
    const [rows] = await pool.query(
      `SELECT id 
       FROM thesis 
       WHERE id = ? 
         AND (
           student_id = ? 
           OR supervisor_id = ? 
           OR member1_id = ? 
           OR member2_id = ?
         )`,
      [thesisId, userId, userId, userId, userId]
    );

    if (rows.length === 0 && !checkPermission('secretary')) {
      return res.status(403).send('Access denied: You are not authorized to view this PDF.');
    }

    // 2. Build the path to the PDF fil
    const pdfPath = path.join(__dirname, `../uploads/reports/${thesisId}_report.pdf`);
    console.log('Serving PDF:', pdfPath);

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).send('PDF not found');
    }

    res.sendFile(pdfPath);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
