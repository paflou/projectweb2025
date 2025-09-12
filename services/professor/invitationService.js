const pool = require('../../db/db');

// Function to get professor invitations
async function getProfessorInvitations(req) {
  const sql = `
    SELECT
      ci.id,
      ci.status,
      ci.sent_at as invitation_date,
      t.id as thesis_id,
      t.title as thesis_title,
      t.description as thesis_description,
      u.name as student_name,
      u.surname as student_surname,
      s.student_number,
      supervisor.name as supervisor_name,
      supervisor.surname as supervisor_surname
    FROM committee_invitation ci
    INNER JOIN thesis t ON ci.thesis_id = t.id
    INNER JOIN student s ON t.student_id = s.id
    INNER JOIN user u ON s.id = u.id
    INNER JOIN user supervisor ON t.supervisor_id = supervisor.id
    WHERE ci.professor_id = ?
    ORDER BY ci.sent_at DESC
  `;

  const params = [req.session.userId];

  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(sql, params);
    console.log(rows);
    conn.release();
    return rows || [];
  } catch (err) {
    conn.release();
    throw err;
  }
}

// Function to accept an invitation
async function acceptInvitation(req, invitationId) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // First, verify that the invitation belongs to the current professor and is pending
    const checkInvitationSql = `
      SELECT id, thesis_id, status
      FROM committee_invitation
      WHERE id = ? AND professor_id = ? AND status = 'pending'
    `;
    const invitationRows = await conn.query(checkInvitationSql, [invitationId, req.session.userId]);

    if (invitationRows.length === 0) {
      await conn.rollback();
      conn.release();
      return { success: false, error: 'Invitation not found or not available for acceptance' };
    }

    const thesisId = invitationRows[0].thesis_id;

    // Check if the thesis already has 2 accepted committee members
    const acceptedCountSql = `
      SELECT COUNT(*) as count
      FROM committee_invitation
      WHERE thesis_id = ? AND status = 'accepted'
    `;
    const countRows = await conn.query(acceptedCountSql, [thesisId]);

    if (countRows[0].count >= 2) {
      await conn.rollback();
      conn.release();
      return { success: false, error: 'This thesis already has the maximum number of committee members' };
    }

    // Update the invitation status to accepted
    const updateSql = `
      UPDATE committee_invitation
      SET status = 'accepted'
      WHERE id = ? AND professor_id = ?
    `;
    const updateResult = await conn.query(updateSql, [invitationId, req.session.userId]);

    if (updateResult.affectedRows === 0) {
      await conn.rollback();
      conn.release();
      return { success: false, error: 'Failed to accept invitation' };
    }

    // Update the thesis table to fill member1_id or member2_id
    const checkThesisMembersSql = `
      SELECT member1_id, member2_id
      FROM thesis
      WHERE id = ?
    `;
    const thesisRows = await conn.query(checkThesisMembersSql, [thesisId]);

    if (thesisRows.length > 0) {
      const thesis = thesisRows[0];
      let updateThesisSql;

      if (thesis.member1_id === null) {
        // Fill member1_id if it's null
        updateThesisSql = `
          UPDATE thesis
          SET member1_id = ?
          WHERE id = ?
        `;
        await conn.query(updateThesisSql, [req.session.userId, thesisId]);
        console.log(`Set member1_id to ${req.session.userId} for thesis ${thesisId}`);
      } else if (thesis.member2_id === null) {
        // Fill member2_id if member1_id is filled but member2_id is null
        updateThesisSql = `
          UPDATE thesis
          SET member2_id = ?
          WHERE id = ?
        `;
        await conn.query(updateThesisSql, [req.session.userId, thesisId]);
        console.log(`Set member2_id to ${req.session.userId} for thesis ${thesisId}`);
      }
    }

    // Check if this acceptance makes it the second accepted member
    const newAcceptedCountSql = `
      SELECT COUNT(*) as count
      FROM committee_invitation
      WHERE thesis_id = ? AND status = 'accepted'
    `;
    const newCountRows = await conn.query(newAcceptedCountSql, [thesisId]);

    // If we now have 2 accepted members, cancel all other pending invitations for this thesis
    if (newCountRows[0].count >= 2) {
      const cancelPendingSql = `
        UPDATE committee_invitation
        SET status = 'rejected'
        WHERE thesis_id = ? AND status = 'pending'
      `;
      await conn.query(cancelPendingSql, [thesisId]);

      console.log(`Cancelled all pending invitations for thesis ${thesisId} as it now has 2 accepted committee members`);
    }

    await conn.commit();
    conn.release();
    return { success: true };

  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('Error in acceptInvitation:', err);
    throw err;
  }
}

// Function to reject an invitation
async function rejectInvitation(req, invitationId, conn) {
  try {
    console.log('DEBUG: Starting rejectInvitation for invitationId:', invitationId, 'professorId:', req.session.userId);

    await conn.beginTransaction();

    // First, verify that the invitation belongs to the current professor and get thesis_id
    const checkInvitationSql = `
      SELECT id, thesis_id, status
      FROM committee_invitation
      WHERE id = ? AND professor_id = ? AND status IN ('pending', 'accepted')
    `;
    console.log('DEBUG: checkInvitationSql:', checkInvitationSql);
    const invitationRows = await conn.query(checkInvitationSql, [invitationId, req.session.userId]);
    console.log('DEBUG: checkInvitationSql result:', invitationRows);

    if (invitationRows.length === 0) {
      console.log('DEBUG: No invitation found or not available for rejection');
      await conn.rollback();
      conn.release();
      return { success: false, error: 'Invitation not found or not available for rejection' };
    }

    const thesisId = invitationRows[0].thesis_id;
    const currentStatus = invitationRows[0].status;
    console.log('DEBUG: Found invitation for thesisId:', thesisId, 'currentStatus:', currentStatus);

    // Update the invitation status to rejected
    const updateSql = `
      UPDATE committee_invitation
      SET status = 'rejected'
      WHERE id = ? AND professor_id = ?
    `;
    console.log('DEBUG: updateSql:', updateSql);
    const updateResult = await conn.query(updateSql, [invitationId, req.session.userId]);
    console.log('DEBUG: updateResult:', updateResult);

    if (updateResult.affectedRows === 0) {
      console.log('DEBUG: Failed to reject invitation');
      await conn.rollback();
      conn.release();
      return { success: false, error: 'Failed to reject invitation' };
    }

    await conn.commit();
    conn.release();
    console.log('DEBUG: Invitation rejected successfully');
    return { success: true };

  } catch (err) {
    console.error('Error in rejectInvitation:', err);
    await conn.rollback();
    conn.release();
    throw err;
  }
}

// Function to remove the professor from the comittee
async function leaveComittee(req, thesisId, invitationId) {
  const conn = await pool.getConnection();
  console.log('DEBUG: Leaving comittee for thesisId', thesisId, 'by professorId', req.session.userId);
  try {
    await conn.beginTransaction();

    const removeProfessorSql = `
      UPDATE thesis
      SET 
          member1_id = CASE WHEN member1_id = ? THEN NULL ELSE member1_id END,
          member2_id = CASE WHEN member2_id = ? THEN NULL ELSE member2_id END,
          supervisor_id = CASE WHEN supervisor_id = ? THEN NULL ELSE supervisor_id END,
          thesis_status = 'under-assignment'
      WHERE id = ?
      AND (? IN (member1_id, member2_id, supervisor_id))
    `;

    const params = [
      req.session.userId, // CASE member1_id
      req.session.userId, // CASE member2_id
      req.session.userId, // CASE supervisor_id
      thesisId,           // WHERE id
      req.session.userId  // ensure professor is in comittee
    ];
    //console.log('DEBUG: SQL Query:', removeProfessorSql);
    //console.log('DEBUG: Params:', params);
    const result = await conn.execute(removeProfessorSql, params);
    //console.log('DEBUG result:', result);

    await conn.commit();

    if (result.affectedRows === 0) {
      return { success: false, error: 'You are not part of this thesis comittee.' };
    }

    // Also reject the corresponding invitation
    await rejectInvitation(req, invitationId, conn);
    conn.release();

    return { success: true };

  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('Error in leaveComittee:', err);
    throw err;
  }
}

async function getThesisInvitations(thesisId) {
  const sql =
    `
SELECT 
    CONCAT(u.name, ' ', u.surname) AS professor_name,
    c.status,
    c.sent_at,
    c.replied_at
FROM committee_invitation AS c
INNER JOIN user AS u ON u.id = c.professor_id
WHERE c.thesis_id = ?
ORDER BY c.sent_at DESC;

  `
  const params = [thesisId];

  const conn = await pool.getConnection();
  try {
    const result = await conn.query(sql, params); // Destructure result
    console.log(result)
    return result;
  } finally {
    conn.release();
  }
}

module.exports = {
  getProfessorInvitations,
  acceptInvitation,
  rejectInvitation,
  leaveComittee,
  getThesisInvitations
};
