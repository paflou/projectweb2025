const express = require('express');
const router = express.Router();
const checkPermission = require('../../middlewares/checkPermission');
const professorService = require('../../services/professor/index');

const {
  getUnderAssignment,
  assignThesisToStudent,
  cancelActiveThesisAssignment,
  cancelThesisUnderAssignment,
  searchStudents,
  getTemporaryAssignments,
  getAssignmentDate,
} = professorService;

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

router.put('/cancel-under-assignment/:thesisId', checkPermission('professor'), async (req, res) => {
  try {
    const { thesisId } = req.params;

    if (!thesisId) {
      return res.status(400).json({ error: 'Thesis ID is required' });
    }

    const result = await cancelThesisUnderAssignment(req, thesisId);

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

router.put('/cancel-active-assignment/:thesisId', checkPermission('professor'), async (req, res) => {
  try {
    const thesisId = req.params.thesisId;
    const { assemblyNumber, assemblyYear } = req.body;
    // Validate required fields
    if (!thesisId) {
      console.error("No thesisId")
      return res.status(400).json({ error: 'Thesis ID is required' });
    }

    if (!assemblyYear || isNaN(assemblyYear) || assemblyYear.toString().length !== 4) {
      console.error("No assembly year")
      return res.status(400).json({ error: 'Valid assembly year is required' });
    }

    const result = await cancelActiveThesisAssignment(req, thesisId, assemblyNumber, assemblyYear);

    if (result.success) {
      res.status(200).json({ message: 'Assignment cancelled successfully' });
    } else {
      console.error(result.error)
      res.status(400).json({ error: result.error });
    }
  } catch (err) {
    console.error('Error in /cancel-assignment:', err);
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

router.get('/get-assignment-date/:id', checkPermission('professor'), async (req, res) => {
  const thesisId = req.params.id;

  if (!thesisId) {
    return res.status(400).send('Thesis ID is required');
  }

  try {
    const date = await getAssignmentDate(thesisId);

    if (!date || date.length === 0) {
      return res.json({ date: [] });
    }

    res.json(date);
  } catch (err) {
    console.error("Error fetching thesis note:", err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;