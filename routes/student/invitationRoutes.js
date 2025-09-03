const express = require("express");
const router = express.Router();

const {
  getCommitteeStatus,
  searchProfessors,
  inviteProfessor,
  cancelPendingInvitations,
  getStudentThesisInfo
} = require("../../services/studentService");
const checkPermission = require("../../middlewares/checkPermission");


// Route: GET /student/committee-status
// Get committee members and pending invitations
router.get('/committee-status', checkPermission('student'), async (req, res) => {
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
router.get('/search-professors', checkPermission('student'), async (req, res) => {
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

// Route: POST /student/invite-professor
// Send invitation to professor for committee membership
router.post('/invite-professor', checkPermission('student'), async (req, res) => {
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

// Route: POST /student/cancel-pending-invitations
// Cancel pending invitations when thesis becomes active
router.post('/cancel-pending-invitations', checkPermission('student'), async (req, res) => {
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

module.exports = router;