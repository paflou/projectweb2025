const express = require('express');
const router = express.Router();
const checkPermission = require('../../middlewares/checkPermission');
const professorService = require('../../services/professor/index');

const {
  getPresentationDate,
  createPresentationAnnouncement,
  getPresentationAnnouncement,
} = professorService;


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

module.exports = router;