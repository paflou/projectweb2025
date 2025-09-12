// Function to get committee status
async function getCommitteeStatus(thesisId) {
  const sql = `
    SELECT
      ci.id,
      ci.status,
      u.name,
      u.surname,
      p.topic,
      p.department
    FROM committee_invitation ci
    INNER JOIN professor p ON ci.professor_id = p.id
    INNER JOIN user u ON p.id = u.id
    WHERE ci.thesis_id = ?
    ORDER BY ci.sent_at DESC
  `;

  const params = [thesisId];
  console.log(sql, params)
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(sql, params);
    conn.release();

    const members = rows.filter(row => row.status === 'accepted');
    const pending = rows.filter(row => row.status === 'pending');

    return { members, pending };
  } catch (err) {
    conn.release();
    throw err;
  }
}

// Function to search professors
async function searchProfessors(query) {
  const sql = `
    SELECT
      u.id,
      u.name,
      u.surname,
      p.topic,
      p.department,
      p.university
    FROM user u
    INNER JOIN professor p ON u.id = p.id
    WHERE
      u.name LIKE ? OR
      u.surname LIKE ? OR
      CONCAT(u.name, ' ', u.surname) LIKE ? OR
      p.topic LIKE ? OR
      p.department LIKE ?
    ORDER BY u.surname, u.name
    LIMIT 10
  `;

  const searchPattern = `%${query}%`;
  const params = [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern];

  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(sql, params);
    conn.release();
    return rows || [];
  } catch (err) {
    conn.release();
    throw err;
  }
}

// Function to invite professor to committee
async function inviteProfessor(req, professorId, message) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Get student's thesis
    const thesisInfo = await getThesisInfo(req);
    if (!thesisInfo) {
      await conn.rollback();
      conn.release();
      return { success: false, error: 'No thesis found for student' };
    }

    // Check if professor is already invited or is the supervisor
    const checkSql = `
      SELECT COUNT(*) AS count 
      FROM committee_invitation
      WHERE thesis_id = ? 
        AND professor_id = ?
        AND status IN ('pending','accepted')

      UNION ALL

      SELECT COUNT(*) AS count 
      FROM thesis
      WHERE id = ? 
      AND supervisor_id = ?;
    `;
    const checkRows = await conn.query(checkSql, [thesisInfo.id, professorId, thesisInfo.id, professorId]);

    if (checkRows.some(row => row.count > 0)) {
      await conn.rollback();
      conn.release();
      return { success: false, error: 'Ο καθηγητής είναι ήδη μέρος της επιτροπής.' };
    }

    // Check if already have 2 accepted invitations
    const acceptedSql = `
      SELECT COUNT(*) as count FROM committee_invitation
      WHERE thesis_id = ? AND status = 'accepted'
    `;
    const acceptedRows = await conn.query(acceptedSql, [thesisInfo.id]);

    if (acceptedRows[0].count >= 2) {
      await conn.rollback();
      conn.release();
      return { success: false, error: 'Η επιτροπή περιέχει ήδη 3 καθηγητές' };
    }

    // Insert invitation
    const insertSql = `
      INSERT INTO committee_invitation (thesis_id, professor_id, status, sent_at)
      VALUES (?, ?, 'pending', NOW())
    `;
    await conn.query(insertSql, [thesisInfo.id, professorId]);

    await conn.commit();
    conn.release();
    return { success: true };

  } catch (err) {
    await conn.rollback();
    conn.release();
    throw err;
  }
}

// Function to cancel pending invitations when thesis becomes active
async function cancelPendingInvitations(thesisId) {
  const conn = await pool.getConnection();

  try {
    const cancelSql = `
      UPDATE committee_invitation
      SET status = 'cancelled'
      WHERE thesis_id = ? AND status = 'pending'
    `;
    await conn.query(cancelSql, [thesisId]);
    conn.release();
    return { success: true };

  } catch (err) {
    conn.release();
    throw err;
  }
}

module.exports = {
  getCommitteeStatus,
  searchProfessors,
  inviteProfessor,
  cancelPendingInvitations
};