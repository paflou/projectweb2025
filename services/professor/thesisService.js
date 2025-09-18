const pool = require('../../db/db');

async function insertThesisToDB(req, res, fields, safeName) {
    // SQL query to insert thesis details into the database
    const sql = `
    INSERT INTO thesis 
    (supervisor_id, member1_id, member2_id,
    student_id, title, description,
    pdf, grade)
    
    VALUES 
    (?, NULL, NULL, 
    NULL, ?, ?,
    ?, NULL) 
    `;

    // Prepare query parameters
    params = [req.session.userId, fields.title, fields.summary, safeName]

    // Get a connection from the pool
    const conn = await pool.getConnection();
    try {
        // Execute the query
        const rows = await conn.query(sql, params);
        conn.release();
        res.status(200).send("Thesis submitted successfully")

        // Return the first row if found, otherwise null
        if (rows.length > 0) {
            return rows[0];
        } else {
            return null;
        }
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            console.error('Duplicate entry error:', err.message);
            // Handle gracefully (e.g., send user-friendly response)
            return res.status(409).send("Thesis already exists")

        }
        else {
            // Release the connection and propagate the error
            conn.release();
            throw err;
        }
    }
}

async function updateThesis(req, res, fields, safeName) {
    let sql = null;
    console.log(safeName)
    // SQL query to insert thesis details into the database
    if (safeName !== 'NULL') {
        sql = `
    UPDATE thesis SET
    title = ?,
    description = ?,
    pdf = ?
    WHERE id = ? AND supervisor_id = ?
    `;
        params = [fields.title, fields.summary, safeName, fields.id, req.session.userId]

    }
    else {
        sql = `
    UPDATE thesis SET
    title = ?,
    description = ?
    WHERE id = ? AND supervisor_id = ?
    `;
        params = [fields.title, fields.summary, fields.id, req.session.userId]

    }

    // Prepare query parameters

    // Log the SQL query and parameters for debugging
    console.log("Update Thesis SQL Query:", sql);
    console.log("Update Thesis Params:", params);


    // Get a connection from the pool
    const conn = await pool.getConnection();
    try {
        // Execute the query
        const rows = await conn.query(sql, params);
        conn.release();
        res.status(200).send("Thesis updated successfully")

        // Return the first row if found, otherwise null
        if (rows.length > 0) {
            return rows[0];
        } else {
            return null;
        }
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            console.error('Duplicate entry error:', err.message);
            // Handle gracefully (e.g., send user-friendly response)
            return res.status(409).send("Thesis already exists")
        }
        else {
            // Release the connection and propagate the error
            conn.release();
            throw err;
        }
    }
}


async function deleteThesis(thesisId, supervisorId) {
    const sql = `
    DELETE FROM thesis
    WHERE id = ? AND supervisor_id = ?
  `;
    const params = [thesisId, supervisorId];

    const conn = await pool.getConnection();
    try {
        const result = await conn.query(sql, params); // Destructure result
        return result;
    } finally {
        conn.release();
    }
}

async function getSpecificThesis(thesisId, professorId) {
    const sql = `
    SELECT
      t.id,
      t.title,
      t.description,
      t.pdf,
      t.thesis_status AS status,
      t.final_repository_link,
      CONCAT(s.name, ' ', s.surname) AS student_name,
      CONCAT(p.name, ' ', p.surname) AS supervisor_name,
      CONCAT(c1.name, ' ', c1.surname) AS member1_name,
      CONCAT(c2.name, ' ', c2.surname) AS member2_name,
      CASE
          WHEN t.supervisor_id = ? THEN 'supervisor'
          WHEN t.member1_id = ? OR member2_id = ? THEN 'committee'
          WHEN t.student_id = ? THEN 'student'
          ELSE 'unknown'
      END AS user_role
  FROM thesis AS t
  LEFT JOIN user AS s ON t.student_id = s.id
  LEFT JOIN user AS c1 ON t.member1_id = c1.id
  LEFT JOIN user AS c2 ON t.member2_id = c2.id
  LEFT JOIN user AS p ON t.supervisor_id = p.id
  WHERE t.id = ? AND ? IN (supervisor_id, member1_id, member2_id, student_id);
  `;


    const params = [professorId, professorId, professorId, professorId, thesisId, professorId];
    // Get a connection from the pool
    const conn = await pool.getConnection();
    try {
        // Execute the query
        const rows = await conn.query(sql, params);
        conn.release();

        // Return the first row if found, otherwise null
        if (rows.length > 0) {
            //console.log(rows)
            return rows[0];
        } else {
            return null;
        }
    } catch (err) {
        // Release the connection and propagate the error
        conn.release();
        throw err;
    }
}


async function markUnderReview(professorId, thesisId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Check the role of the user for this thesis
    const roleSql = `
            SELECT 
                CASE
                    WHEN supervisor_id = ? THEN 'supervisor'
                    WHEN member1_id = ? OR member2_id = ? THEN 'member'
                    ELSE NULL
                END AS role
            FROM thesis
            WHERE id = ?;
        `;
    const rows = await conn.query(roleSql, [professorId, professorId, professorId, thesisId]);

    if (!rows || rows.length === 0 || !rows[0].role) {
      await conn.rollback();
      conn.release();
      return { success: false, error: 'You are not authorized to update this thesis' };
    }

    if (rows[0].role !== 'supervisor') {
      await conn.rollback();
      conn.release();
      return { success: false, error: 'Only supervisors can mark under review' };
    }

    // 2. Update thesis status
    const updateSql = `
            UPDATE thesis
            SET thesis_status = 'under-review'
            WHERE id = ?;
        `;
    const updateResult = await conn.query(updateSql, [thesisId]);

    if (!updateResult || updateResult.affectedRows === 0) {
      await conn.rollback();
      conn.release();
      return { success: false, error: 'Failed to update thesis status' };
    }

    // 3. Log the action
    const logSql = `
            INSERT INTO thesis_log (thesis_id, user_id, user_role, action)
            VALUES (?, ?, 'supervisor', 'marked as under review');
        `;
    await conn.query(logSql, [thesisId, professorId]);

    await conn.commit();
    conn.release();
    return { success: true };
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('Error in markUnderReview:', err);
    return { success: false, error: 'Server error' };
  }
}

async function getDraftFilename(thesisId, professorId) {
  const sql = `
    SELECT draft
    FROM thesis
    WHERE id = ?
      AND (
        supervisor_id = ? 
        OR member1_id = ? 
        OR member2_id = ?
      );
  `;

  const filename = await pool.query(sql, [thesisId, professorId, professorId, professorId]);

  // If no file found 
  if (filename.length === 0) {
    return null;
  }

  return filename[0].draft;
}

async function getPresentationDate(thesisId, professorId) {
  const sql = `
    SELECT
    exam_datetime,
    exam_mode,
    exam_location
    FROM thesis
    WHERE id = ?
      AND (
        supervisor_id = ? 
        OR member1_id = ? 
        OR member2_id = ?
      );
  `;

  const date = await pool.query(sql, [thesisId, professorId, professorId, professorId]);

  // If no date found 
  if (date.length === 0) {
    return null;
  }

  return date[0];
}

module.exports = {
  insertThesisToDB,
  updateThesis,
  deleteThesis,
  getSpecificThesis,
  markUnderReview,
  getDraftFilename,
  getPresentationDate
};
