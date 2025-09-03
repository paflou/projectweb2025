const express = require('express');
const router = express.Router();
const { submitThesis } = require("../../controllers/professorController");
const pool = require('../../db/db');
const checkPermission = require('../../middlewares/checkPermission');
const professorService = require('../../services/professorService');

const {
  getRelevantThesis,
  getUnderAssignment,
  getAvailableTopics,
  assignThesisToStudent,
  cancelThesisAssignment,
  searchStudents,
  getTemporaryAssignments,
  getThesisTimeline,
  deleteThesis
} = professorService;


// Fetch and return the theses the professor is supervising or is committee member of
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

// Fetch and return the professors thesis' under assignment as JSON
router.get('/get-under-assignment', checkPermission('professor'), async (req, res) => {
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

// Saves a new thesis created by a professor
router.post('/create-topic', checkPermission('professor'), (req, res) => {
  submitThesis(req, res, 'insert');
});

router.post('/update-topic', checkPermission('professor'), (req, res) => {
  submitThesis(req, res, 'update');
});


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

router.get('/temporary-assignments', checkPermission('professor'), async (req, res) => {
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

router.post('/assign-thesis', checkPermission('professor'), async (req, res) => {
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

router.get('/search-students', checkPermission('professor'), async (req, res) => {
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

router.get('/manage/:id', checkPermission('professor'), async (req, res) => {
  const thesisId = req.params.id;

  if (!thesisId) {
    return res.status(400).send('Thesis ID is required');
  }  

  // Logic to manage the thesis with the given ID
  res.send(`Manage thesis with ID: ${thesisId}`);
});

module.exports = router;