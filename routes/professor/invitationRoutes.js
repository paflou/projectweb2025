const express = require('express');
const router = express.Router();
const pool = require('../../db/db');
const checkPermission = require('../../middlewares/checkPermission');
const professorService = require('../../services/professor/index');

const {
  getProfessorInvitations,
  acceptInvitation,
  rejectInvitation,
  leaveComittee
} = professorService;

// Route: GET /professor/get-invitations
// Get committee invitations for the professor
router.get('/get-invitations', checkPermission('professor'), async (req, res) => {
  try {
    const invitations = await getProfessorInvitations(req);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ invitations }, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    ));
  } catch (err) {
    console.error('Error in /get-invitations:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route: POST /professor/accept-invitation
// Accept a committee invitation
router.post('/accept-invitation',checkPermission('professor'), async (req, res) => {
  try {
    const { invitationId } = req.body;

    if (!invitationId) {
      return res.status(400).json({ error: 'Invitation ID is required' });
    }

    const result = await acceptInvitation(req, invitationId);

    if (result.success) {
      res.status(200).json({ message: 'Invitation accepted successfully' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (err) {
    console.error('Error in /accept-invitation:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route: POST /professor/reject-invitation
// Reject a committee invitation
router.post('/reject-invitation',checkPermission('professor'), async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const { invitationId } = req.body;

    if (!invitationId) {
      return res.status(400).json({ error: 'Invitation ID is required' });
    }

    const result = await rejectInvitation(req, invitationId, conn);

    if (result.success) {
      res.status(200).json({ message: 'Invitation rejected successfully' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (err) {
    console.error('Error in /reject-invitation:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route: POST /professor/leave-comittee
// Leave a committee for a thesis
router.post('/leave-comittee', checkPermission('professor'), async (req, res) => {
  try {
    const { thesisId, invitationId } = req.body;

    if (!thesisId) {
      return res.status(400).json({ error: 'thesis ID is required' });
    }

    const result = await leaveComittee(req, thesisId, invitationId);

    if (result.success) {
      res.status(200).json({ message: 'Left the comittee successfully' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (err) {
    console.error('Error in /leave-comittee', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;