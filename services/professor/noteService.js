const pool = require('../../db/db');

async function addNoteForThesis(professorId, thesisId, text) {
  let conn;
  try {
    conn = await pool.getConnection();

    const sql = `
      INSERT INTO professor_notes (thesis_id, professor_id, note)
      VALUES (?, ?, ?)
    `;
    const params = [thesisId, professorId, text.trim()];

    await conn.query(sql, params);

    return { success: true };
  } catch (err) {
    console.error('Error in addNoteForThesis:', err);
    return { success: false, error: 'Database error' };
  } finally {
    if (conn) conn.release();
  }
}

async function editNote(noteId, professorId, text) {
  let conn;
  try {
    conn = await pool.getConnection();
    const sql = `
            UPDATE professor_notes
            SET note = ?
            WHERE id = ? AND professor_id = ?
        `;
    const result = await conn.query(sql, [text.trim(), noteId, professorId]);
    if (result.affectedRows === 0) {
      return { success: false, error: 'Note not found or not allowed to edit.' };
    }
    return { success: true };
  } catch (err) {
    console.error('Error in editNote:', err);
    return { success: false, error: 'Database error' };
  } finally {
    if (conn) conn.release();
  }
}

async function deleteNote(noteId, professorId) {
  let conn;
  try {
    conn = await pool.getConnection();
    const sql = `
            DELETE FROM professor_notes
            WHERE id = ? AND professor_id = ?
        `;
    const result = await conn.query(sql, [noteId, professorId]);
    if (result.affectedRows === 0) {
      return { success: false, error: 'Note not found or not allowed to delete.' };
    }
    return { success: true };
  } catch (err) {
    console.error('Error in deleteNote:', err);
    return { success: false, error: 'Database error' };
  } finally {
    if (conn) conn.release();
  }
}

async function getProfessorNotesForThesis(professorId, thesisId) {
  const sql =
    `
SELECT 
    id, note
    FROM professor_notes
    WHERE thesis_id = ? AND professor_id = ?;
  `
  const params = [thesisId, professorId];

  const conn = await pool.getConnection();
  try {
    const result = await conn.query(sql, params); // Destructure result
    //console.log(result)
    return result;
  } finally {
    conn.release();
  }
}

module.exports = {
  addNoteForThesis,
  editNote,
  deleteNote,
  getProfessorNotesForThesis
};