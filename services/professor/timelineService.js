const pool = require('../../db/db');

async function getThesisTimeline(thesisId) {
    const sql = `
    SELECT
      action,
      created_at as event_date,
      user_role,
      user.name,
      user.surname
    FROM thesis_log
    LEFT JOIN user
    ON thesis_log.user_id = user.id
    WHERE thesis_id = ?
    ORDER BY event_date ASC
  `;

    const params = [thesisId];

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

module.exports = {
  getThesisTimeline
};