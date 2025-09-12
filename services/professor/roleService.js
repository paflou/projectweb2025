const pool = require('../../db/db');

async function getProfessorRole(thesisId, professorId) {
  const sql = `
        SELECT 
            CASE
                WHEN supervisor_id = ? THEN 'supervisor'
                WHEN member1_id = ? OR member2_id = ? THEN 'member'
                ELSE NULL
            END AS role
        FROM thesis
        WHERE id = ?;
    `;

  const rows = await pool.query(sql, [professorId, professorId, professorId, thesisId]);
  console.log(rows)
  // If no thesis found or professor not related
  if (rows.length === 0 || !rows[0].role) {
    return null;
  }

  return rows[0].role;
}

module.exports = {
  getProfessorRole
};