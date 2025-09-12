const express = require('express');
const router = express.Router();
const checkPermission = require('../../middlewares/checkPermission');
const professorService = require('../../services/professor/index');

const {
  getProfessorNotesForThesis,
  addNoteForThesis,
  editNote,
  deleteNote,
} = professorService;



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

module.exports = router;