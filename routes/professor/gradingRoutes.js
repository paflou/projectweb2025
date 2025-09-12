const express = require('express');
const router = express.Router();
const checkPermission = require('../../middlewares/checkPermission');
const professorService = require('../../services/professor/index');
const fs = require("fs");

const {
  enableGrading,
  getGradingStatus,
  getGrades,
  saveProfessorGrade
} = professorService;




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



module.exports = router;