const express = require('express');
const router = express.Router();
const { submitThesis } = require("../../controllers/professorController");
const checkPermission = require('../../middlewares/checkPermission');
const professorService = require('../../services/professorService');
const path = require("path");
const fs = require("fs");

const {
  getRelevantThesis,
  getUnderAssignment,
  getAvailableTopics,
  assignThesisToStudent,
  cancelActiveThesisAssignment,
  cancelThesisUnderAssignment,
  searchStudents,
  getTemporaryAssignments,
  getThesisTimeline,
  deleteThesis,
  getInstructorStatistics,
  getSpecificThesis,
  getThesisInvitations,
  getProfessorNotesForThesis,
  addNoteForThesis,
  editNote,
  deleteNote,
  getProfessorRole,
  getAssignmentDate,
  markUnderReview,
  getDraftFilename,
  getPresentationDate,
  createPresentationAnnouncement,
  getPresentationAnnouncement,
  enableGrading,
  getGradingStatus,
  getGrades,
  saveProfessorGrade
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

router.get('/get-thesis-invitations/:id', checkPermission('professor'), async (req, res) => {
  const thesisId = req.params.id;

  if (!thesisId) {
    return res.status(400).send('Thesis ID is required');
  }

  try {
    const invitations = await getThesisInvitations(thesisId);

    if (!invitations || invitations.length === 0) {
      return res.json({ invitations: [] });
    }

    res.json(Array.isArray(invitations) ? invitations : []);
  } catch (err) {
    console.error("Error fetching thesis invitations:", err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/get-notes/:id', checkPermission('professor'), async (req, res) => {
  const thesisId = req.params.id;

  if (!thesisId) {
    return res.status(400).send('Thesis ID is required');
  }

  try {
    const note = await getProfessorNotesForThesis(req.session.userId, thesisId);

    if (!note || note.length === 0) {
      return res.json({ note: [] });
    }

    res.json(note);
  } catch (err) {
    console.error("Error fetching thesis note:", err);
    res.status(500).send('Internal Server Error');
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

router.post('/add-thesis-note', checkPermission('professor'), async (req, res) => {
  const { thesisId, text } = req.body;

  if (!thesisId || !text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Invalid input: thesisId and text are required.' });
  }

  if (text.length > 300) {
    return res.status(400).json({ error: 'Note cannot exceed 300 characters.' });
  }

  try {
    const response = await addNoteForThesis(req.session.userId, thesisId, text);

    if (response.success) {
      return res.status(200).json({ success: true, message: 'Note added successfully.' });
    } else {
      return res.status(400).json({ error: response.error || 'Failed to add note.' });
    }

  } catch (err) {
    console.error('Error adding note:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

router.put('/edit-thesis-note', checkPermission('professor'), async (req, res) => {
  const { noteId, text } = req.body;
  //console.log(noteId);
  //console.log(text)
  if (!noteId || !text || text.length === 0 || text.length > 300) {
    return res.status(400).json({ error: 'Invalid input.' });
  }
  const response = await editNote(noteId, req.session.userId, text);
  //console.log(response)
  if (response.success)
    return res.status(200).json({ success: true, message: 'Note updated successfully.' });
  return res.status(400).json({ error: response.error });
});

router.delete('/delete-thesis-note', checkPermission('professor'), async (req, res) => {
  const { noteId } = req.body;
  if (!noteId)
    return res.status(400).json({ error: 'noteId is required.' });
  const response = await deleteNote(noteId, req.session.userId);
  if (response.success)
    return res.status(200).json({ success: true, message: 'Note deleted successfully.' });
  return res.status(400).json({ error: response.error });
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

router.get('/get-presentation-date/:id', checkPermission('professor'), async (req, res) => {
  const thesisId = req.params.id;

  if (!thesisId) {
    return res.status(400).send('Thesis ID is required');
  }

  try {
    const date = await getPresentationDate(thesisId, req.session.userId);

    if (!date || date.length === 0) {
      return res.json({ date: [] });
    }

    res.json(date);
  } catch (err) {
    console.error("Error fetching exam date:", err);
    res.status(500).send('Internal Server Error');
  }
});

// Get instructor statistics
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

router.post('/create-presentation-announcement/:thesisId', checkPermission('professor'), async (req, res) => {
  try {
    const thesisId = req.params.thesisId;
    const text = req.body.text;

    if (!thesisId || !text) {
      return res.status(400).json({ error: 'Thesis ID and announcement text is required' });
    }

    const result = await createPresentationAnnouncement(thesisId, text);

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

router.get('/get-presentation-announcement/:thesisId', checkPermission('professor'), async (req, res) => {
  const thesisId = req.params.thesisId;

  if (!thesisId) {
    return res.status(400).send('Thesis ID is required');
  }

  try {
    const announcement = await getPresentationAnnouncement(thesisId);

    if (!announcement || announcement.length === 0) {
      return res.json({ announcement: [] });
    }
    //console.log(announcement)
    res.json(announcement);
  } catch (err) {
    console.error("Error fetching exam date:", err);
    res.status(500).send('Internal Server Error');
  }
});

router.put('/enable-grading/:thesisId', checkPermission('professor'), async (req, res) => {
  try {
    const { thesisId } = req.params;

    if (!thesisId) {
      return res.status(400).json({ error: 'Thesis ID is required' });
    }

    const result = await enableGrading(thesisId, req.session.userId);

    if (result) {
      res.status(200).json({ message: 'Grading enabled successfully' });
    } else {
      res.status(400).json({ error: 'No thesis found or you are not the supervisor' });
    }
  } catch (err) {
    console.error('Error in /enable-grading:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

router.get('/get-grading-status/:thesisId', checkPermission('professor'), async (req, res) => {
  const thesisId = req.params.thesisId;

  if (!thesisId) {
    return res.status(400).send('Thesis ID is required');
  }

  try {
    const status = await getGradingStatus(thesisId);
    console.log(status)

    if (!status || status.length === 0) {
      return res.json({ status: false });
    }
    return res.json({ status: true });
  } catch (err) {
    console.error("Error fetching exam date:", err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/get-grades/:id', checkPermission('professor'), async (req, res) => {
  const thesisId = req.params.id;
  const professorId = req.session.userId;

  if (!thesisId) {
    return res.status(400).send('Thesis ID is required');
  }

  try {
    const grades = await getGrades(thesisId);

    if (!grades || grades.length === 0) {
      return res.json({ grades: [], message: '' });
    }

    // Check if the current professor has graded
    const hasGraded = grades.some(grade => grade.id === professorId);

    const message = hasGraded
      ? 'hasGraded'
      : 'hasNotGraded';

    res.json({ grades, message });
  } catch (err) {
    console.error("Error fetching thesis grades:", err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/save-grade/:thesisId', checkPermission('professor'), async (req, res) => {
  try {
    const thesisId = req.params.thesisId;
    const data = req.body.data;

    if (!thesisId || !data) {
      return res.status(400).json({ error: 'Thesis ID and data is required' });
    }

    const result = await saveProfessorGrade(req.session.userId, thesisId, data);

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

router.get('/get-thesis-invitations/:id', checkPermission('professor'), async (req, res) => {
  const thesisId = req.params.id;

  if (!thesisId) {
    return res.status(400).send('Thesis ID is required');
  }

  try {
    const invitations = await getThesisInvitations(thesisId);

    if (!invitations || invitations.length === 0) {
      return res.json({ invitations: [] });
    }

    res.json(Array.isArray(invitations) ? invitations : []);
  } catch (err) {
    console.error("Error fetching thesis invitations:", err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/get-notes/:id', checkPermission('professor'), async (req, res) => {
  const thesisId = req.params.id;

  if (!thesisId) {
    return res.status(400).send('Thesis ID is required');
  }

  try {
    const note = await getProfessorNotesForThesis(req.session.userId, thesisId);

    if (!note || note.length === 0) {
      return res.json({ note: [] });
    }

    res.json(note);
  } catch (err) {
    console.error("Error fetching thesis note:", err);
    res.status(500).send('Internal Server Error');
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

router.post('/add-thesis-note', checkPermission('professor'), async (req, res) => {
  const { thesisId, text } = req.body;

  if (!thesisId || !text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Invalid input: thesisId and text are required.' });
  }

  if (text.length > 300) {
    return res.status(400).json({ error: 'Note cannot exceed 300 characters.' });
  }

  try {
    const response = await addNoteForThesis(req.session.userId, thesisId, text);

    if (response.success) {
      return res.status(200).json({ success: true, message: 'Note added successfully.' });
    } else {
      return res.status(400).json({ error: response.error || 'Failed to add note.' });
    }

  } catch (err) {
    console.error('Error adding note:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

router.put('/edit-thesis-note', checkPermission('professor'), async (req, res) => {
  const { noteId, text } = req.body;
  console.log(noteId);
  console.log(text)
  if (!noteId || !text || text.length === 0 || text.length > 300) {
    return res.status(400).json({ error: 'Invalid input.' });
  }
  const response = await editNote(noteId, req.session.userId, text);
  console.log(response)
  if (response.success)
    return res.status(200).json({ success: true, message: 'Note updated successfully.' });
  return res.status(400).json({ error: response.error });
});

router.delete('/delete-thesis-note', checkPermission('professor'), async (req, res) => {
  const { noteId } = req.body;
  if (!noteId)
    return res.status(400).json({ error: 'noteId is required.' });
  const response = await deleteNote(noteId, req.session.userId);
  if (response.success)
    return res.status(200).json({ success: true, message: 'Note deleted successfully.' });
  return res.status(400).json({ error: response.error });
});


module.exports = router;