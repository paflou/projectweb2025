const pool = require('../../db/db');

async function enableGrading(thesisId, professorId) {
  const sql = `
    UPDATE thesis
    SET grading_enabled = TRUE
    WHERE id = ? AND supervisor_id = ?
  `;

  const response = await pool.query(sql, [thesisId, professorId]);

  if (response.affectedRows === 0) {
    throw new Error("No thesis found or you are not the supervisor");
  }

  return true;
}
async function getGradingStatus(thesisId) {
  const sql = `
    SELECT
    grading_enabled
    FROM thesis
    WHERE id = ?
  `;

  const status = await pool.query(sql, thesisId);


  if (status.length === 0) return null;

  return !!status[0].grading_enabled;
}
async function getGrades(thesisId) {
  const sql = `
  SELECT 
      tg.criterion1,
      tg.criterion2,
      tg.criterion3,
      tg.criterion4,
      p.name AS professor_name,
      p.surname AS professor_surname,
      p.id
  FROM thesis_grades tg
  INNER JOIN user p ON tg.professor_id = p.id
  WHERE tg.thesis_id = ?;
  `;

  const grades = await pool.query(sql, thesisId);

  //console.log(grades)
  return grades;

}
async function saveProfessorGrade(professorId, thesisId, data) {
  try {
    const sql = `
      INSERT INTO thesis_grades
      (thesis_id, professor_id, criterion1,
      criterion2, criterion3, criterion4)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [thesisId, professorId, data.criterion1,
      data.criterion2, data.criterion3, data.criterion4];

    await pool.query(sql, params);

    return { success: true };
  } catch (err) {
    console.error('Error in saveProfessorGrade:', err);
    return { success: false, error: 'Database error' };
  }
}

module.exports = {
  enableGrading,
  getGradingStatus,
  getGrades,
  saveProfessorGrade
};