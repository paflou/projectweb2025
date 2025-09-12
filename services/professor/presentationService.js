const pool = require('../../db/db');

async function createPresentationAnnouncement(thesisId, text) {
  let conn;
  try {
    conn = await pool.getConnection();

    const sql = `
      INSERT INTO thesis_announcement (thesis_id, announcement_text)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE
      announcement_text = VALUES(announcement_text),
      created_at = CURRENT_TIMESTAMP;
    `;
    const params = [thesisId, text];
    await conn.query(sql, params);

    return { success: true };
  } catch (err) {
    console.error('Error in createPresentationAnnouncement:', err);
    return { success: false, error: 'Database error' };
  } finally {
    if (conn) conn.release();
  }
}

async function getPresentationAnnouncement(thesisId) {
  const sql = `
    SELECT
    announcement_text
    FROM thesis_announcement
    WHERE thesis_id = ?
  `;

  const presentation = await pool.query(sql, thesisId);

  // If no presentation found 
  if (presentation.length === 0) {
    return null;
  }

  return presentation[0];
}

module.exports = {
  createPresentationAnnouncement,
  getPresentationAnnouncement
};