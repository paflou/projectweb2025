const express = require('express');
const router = express.Router();
const { submitThesis } = require("../../controllers/professorController");
const checkPermission = require('../../middlewares/checkPermission');
const professorService = require('../../services/professor/index');
const path = require("path");
const fs = require("fs");

const {
  getRelevantThesis,
  getAvailableTopics,
  getThesisTimeline,
  deleteThesis,
  getInstructorStatistics,
  getSpecificThesis,
  getProfessorRole,
  markUnderReview,
  getDraftFilename,
} = professorService;

router.get('/check-professor-role/:thesisId', checkPermission('professor'), async (req, res) => {
  try {
    const professorId = req.session.userId;
    const thesisId = req.params.thesisId;

    // Retrieve student information from the database
    const role = await getProfessorRole(thesisId, professorId);
    if (role) {
      // Set response header to JSON and send the info
      res.setHeader('Content-Type', 'application/json');
      res.json({ role });
    } else {
      // If no info found, send 200 with empty array
      res.status(200).json({ role: [] });
    }
  } catch (err) {
    // Log and send server error if something goes wrong
    console.error('Error in /get-info:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

router.get('/get-relevant-thesis', checkPermission('professor'), async (req, res) => {
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

// Saves a new thesis created by a professor
router.post('/create-topic', checkPermission('professor'), (req, res) => {
  submitThesis(req, res, 'insert');
});

router.post('/update-topic', checkPermission('professor'), (req, res) => {
  submitThesis(req, res, 'update');
});

router.delete('/delete-topic', checkPermission('professor'), async (req, res) => {
  try {
    const id = req.body.id;
    if (!id) {
      return res.status(400).send('Thesis ID is required');
    }

    const result = await deleteThesis(id, req.session.userId);

    if (result.affectedRows > 0) {
      res.status(200).send('Thesis deleted successfully');
    } else {
      res.status(404).send('Thesis not found or not owned by you');
    }
  } catch (err) {
    console.error('Error in DELETE /delete-topic:', err);
    res.status(500).send('Server error');
  }
}
);

router.get('/available-topics', checkPermission('professor'), async (req, res) => {
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

router.put('/mark-under-review/:thesisId', checkPermission('professor'), async (req, res) => {
  try {
    const { thesisId } = req.params;

    if (!thesisId) {
      return res.status(400).json({ error: 'Thesis ID is required' });
    }

    const result = await markUnderReview(req.session.userId, thesisId);

    if (result.success) {
      res.status(200).json({ message: 'Assignment marked as under review successfully' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (err) {
    console.error('Error in /mark-under-review:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

router.get('/get-thesis-timeline/:id', checkPermission('professor'), async (req, res) => {
  try {
    const thesisId = req.params.id;
    if (!thesisId) {
      return res.status(400).json({ error: 'Thesis ID is required' });
    }

    const timeline = await getThesisTimeline(thesisId);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ timeline }, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    ));
  } catch (err) {
    console.error('Error in /get-thesis-timeline:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

router.get('/get-specific-thesis/:id', checkPermission('professor'), async (req, res) => {
  const thesisId = req.params.id;

  if (!thesisId) {
    return res.status(400).send('Thesis ID is required');
  }
  const thesis = await getSpecificThesis(thesisId, req.session.userId);
  if (!thesis) {
    return res.status(404).send('Thesis not found or you do not have permission to manage it');
  }

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ thesis }, (_, v) =>
    typeof v === 'bigint' ? v.toString() : v
  ));
});

router.get('/download-thesis/:thesisId', checkPermission('professor'), async (req, res) => {
  try {
    const { thesisId } = req.params;
    const professorId = req.session.userId;

    const filename = await getDraftFilename(thesisId, professorId);

    if (!filename) {
      return res.status(403).json({ error: 'Access denied or file not found' });
    }

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

router.get('/statistics', checkPermission('professor'), async (req, res) => {
  try {
    const statistics = await getInstructorStatistics(req);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ statistics }, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    ));
  } catch (err) {
    console.error('Error in /statistics:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;