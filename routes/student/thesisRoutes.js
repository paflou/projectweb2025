const express = require('express');
const router = express.Router();
const pool = require("../../db/db");
const fs = require('fs');
const path = require("path");
const checkPermission = require("../../middlewares/checkPermission");
const { handleThesisUpload } = require("../../middlewares/handleFileUpload");

const {
  getThesisInfo,
  getDetailedThesisInfo,
  addMaterialLink,
  saveExamDetails,
  saveRepositoryLink,
  saveFileNameToDB
} = require("../../services/student/index");

const { getThesisTimeline } = require("../../services/professor/index");

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
      res.status(200).json({ message: 'Link added successfully', linkId: result.linkId.toString() });
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


router.get('/material-links', checkPermission('student'), async (req, res) => {
  try {
    const thesisInfo = await getThesisInfo(req);
    if (!thesisInfo) {
      return res.status(400).json({ error: 'No thesis found for student' });
    }
    const sql = `
      SELECT id, url
      FROM additional_thesis_material
      WHERE thesis_id = ?
    `;
    const params = [thesisInfo.id];
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query(sql, params);
      conn.release();
      res.status(200).json({ links: rows.map(row => ({ id: row.id.toString(), url: row.url })) });
    } catch (err) {
      conn.release();
      throw err;
    }
  } catch (err) {
    console.error('Error in /material-links:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

router.delete('/material-links/:id', checkPermission('student'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Link ID is required' });
    }
    const thesisInfo = await getThesisInfo(req);
    if (!thesisInfo) {
      return res.status(400).json({ error: 'No thesis found for student' });
    }
    const sql = `
      DELETE FROM additional_thesis_material
      WHERE id = ? AND thesis_id = ?
    `;
    const params = [id, thesisInfo.id];

    console.log("Deleting link with params:", params);

    const conn = await pool.getConnection();
    try {
      const result = await conn.query(sql, params);
      conn.release();
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Link deleted successfully' });
      } else {
        res.status(404).json({ error: 'Link not found or does not belong to your thesis' });
      }
    } catch (err) {
      conn.release();
      throw err;
    }
  } catch (err) {
    console.error('Error in DELETE /material-links:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

router.get('/repository-link', checkPermission('student'), async (req, res) => {
  try {
    const thesisInfo = await getThesisInfo(req);
    if (thesisInfo && thesisInfo.final_repository_link) {
      res.status(200).json({ repositoryLink: thesisInfo.final_repository_link });
    } else {
      res.status(404).json({ error: 'No repository link found' });
    }
  } catch (err) {
    console.error('Error in /repository-link:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route: GET /student/thesis-timeline/:id
// Get thesis timeline/history for student's own thesis
router.get('/thesis-timeline/:id', checkPermission('student'), async (req, res) => {
  try {
    const thesisId = req.params.id;
    if (!thesisId) {
      return res.status(400).json({ error: 'Thesis ID is required' });
    }

    // Verify that the thesis belongs to the current student
    const thesisInfo = await getThesisInfo(req);
    if (!thesisInfo || thesisInfo.id != thesisId) {
      return res.status(403).json({ error: 'Access denied to this thesis' });
    }

    const timeline = await getThesisTimeline(thesisId);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ timeline }, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    ));
  } catch (err) {
    console.error('Error in /thesis-timeline:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;