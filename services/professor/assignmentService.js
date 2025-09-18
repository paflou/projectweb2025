const pool = require('../../db/db');

// Function to fetch under assignment thesis' of current professor
async function getUnderAssignment(req) {
  // SQL query to select user and student fields by user ID
  const sql = `
    SELECT id, title, description, pdf
    FROM thesis
    WHERE supervisor_id = ? AND thesis_status = 'under-assignment'
  `;

  // Use the userId from the session as the query parameter
  const params = [req.session.userId];
  // Get a connection from the pool
  const conn = await pool.getConnection();
  try {
    // Execute the query
    const rows = await conn.query(sql, params);
    conn.release();

    // Return the first row if found, otherwise null
    if (rows.length > 0) {
      //console.log(rows)
      return rows;
    } else {
      return null;
    }
  } catch (err) {
    // Release the connection and propagate the error
    conn.release();
    throw err;
  }
}

// Function to fetch relevant thesis' of current professor
async function getRelevantThesis(req) {
  // SQL query to select thesis where professor is supervisor or committee member
  const sql = `
  SELECT
      t.id,
      t.title,
      t.description,
      t.pdf,
      t.thesis_status AS status,
      t.final_repository_link,
      t.grade,
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
  WHERE ? IN (supervisor_id, member1_id, member2_id, student_id);
  `;

  // Use the userId from the session as the query parameter
  const params = [req.session.userId, req.session.userId, req.session.userId, req.session.userId, req.session.userId];
  // Get a connection from the pool
  const conn = await pool.getConnection();
  try {
    // Execute the query
    const rows = await conn.query(sql, params);
    conn.release();

    // Return the first row if found, otherwise null
    if (rows.length > 0) {
      //console.log(rows)
      return rows;
    } else {
      return null;
    }
  } catch (err) {
    // Release the connection and propagate the error
    conn.release();
    throw err;
  }
}

// Function to search for students by student number or name (only students without thesis)
async function searchStudents(query) {
  const sql = `
    SELECT
      user.id,
      user.name,
      user.surname,
      user.email,
      student.student_number
    FROM user
    INNER JOIN student ON user.id = student.id
    LEFT JOIN thesis ON student.id = thesis.student_id
    WHERE
      thesis.student_id IS NULL
      AND (
        student.student_number LIKE ? OR
        user.name LIKE ? OR
        user.surname LIKE ? OR
        CONCAT(user.name, ' ', user.surname) LIKE ?
      )
    ORDER BY student.student_number
    LIMIT 10
  `;

  const searchPattern = `%${query}%`;
  const params = [searchPattern, searchPattern, searchPattern, searchPattern];

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

// Function to get available thesis topics for assignment
async function getAvailableTopics(req) {
  const sql = `
    SELECT
      id,
      title,
      description,
      pdf,
      submission_date
    FROM thesis
    WHERE supervisor_id = ? AND thesis_status = 'under-assignment' AND student_id IS NULL
    ORDER BY submission_date DESC
  `;

  const params = [req.session.userId];

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

// Function to get temporary assignments awaiting committee approval
async function getTemporaryAssignments(req) {
  const sql = `
    SELECT
      t.id,
      t.title,
      t.description,
      t.submission_date,
      u.name as student_name,
      u.surname as student_surname,
      s.student_number,
      COALESCE(ci.pending_invitations, 0) as pending_invitations,
      COALESCE(ci.accepted_invitations, 0) as accepted_invitations
    FROM thesis t
    INNER JOIN student s ON t.student_id = s.id
    INNER JOIN user u ON s.id = u.id
    LEFT JOIN (
      SELECT
        thesis_id,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_invitations,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted_invitations
      FROM committee_invitation
      GROUP BY thesis_id
    ) ci ON t.id = ci.thesis_id
    WHERE t.supervisor_id = ?
      AND t.thesis_status = 'under-assignment'
      AND t.student_id IS NOT NULL
      AND COALESCE(ci.accepted_invitations, 0) < 2
    ORDER BY t.submission_date DESC
  `;

  const params = [req.session.userId];

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

// Function to assign a thesis to a student
async function assignThesisToStudent(req, thesisId, studentId) {
  const conn = await pool.getConnection();

  try {
    // Start transaction
    await conn.beginTransaction();

    // First, verify that the thesis belongs to the current professor and is available
    const checkThesisSql = `
      SELECT id, title, student_id
      FROM thesis
      WHERE id = ? AND supervisor_id = ? AND thesis_status = 'under-assignment'
    `;
    const thesisRows = await conn.query(checkThesisSql, [thesisId, req.session.userId]);

    if (thesisRows.length === 0) {
      await conn.rollback();
      conn.release();
      return { success: false, error: 'Thesis not found or not available for assignment' };
    }

    // Check if thesis is already assigned
    if (thesisRows[0].student_id !== null) {
      await conn.rollback();
      conn.release();
      return { success: false, error: 'Thesis is already assigned to another student' };
    }

    // Update the thesis with the student ID
    const updateSql = `
      UPDATE thesis
      SET student_id = ?
      WHERE id = ? AND supervisor_id = ?
    `;
    const updateResult = await conn.query(updateSql, [studentId, thesisId, req.session.userId]);

    if (updateResult.affectedRows === 0) {
      await conn.rollback();
      conn.release();
      return { success: false, error: 'Failed to assign thesis' };
    }

    // Commit transaction
    await conn.commit();
    conn.release();

    return { success: true };

  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('Error in assignThesisToStudent:', err);
    throw err;
  }
}

async function getAssignmentDate(thesisId) {
  const sql = `
        SELECT 
          created_at
        FROM thesis_log
        WHERE thesis_id = ? AND action = 'assigned'
        ORDER BY created_at DESC LIMIT 1;
    `;

  const rows = await pool.query(sql, thesisId);
  console.log(rows)
  // If no thesis found or professor not related
  if (rows.length === 0) {
    return null;
  }

  return rows[0].created_at;
}

// We assume when a thesis under assignment gets cancelled there's no general assembly required
async function cancelThesisUnderAssignment(req, thesisId) {
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const checkThesisSql = `
      SELECT id, title, student_id
      FROM thesis
      WHERE id = ? AND supervisor_id = ? AND thesis_status = 'under-assignment'
    `;
        const thesisRow = await conn.query(checkThesisSql, [thesisId, req.session.userId]);
        console.log('DEBUG checkThesisSql result:', thesisRow);

        if (!thesisRow) {
            await conn.rollback();
            conn.release();
            return { success: false, error: 'Thesis not found or not available for cancellation' };
        }

        if (thesisRow.student_id === null) {
            await conn.rollback();
            conn.release();
            return { success: false, error: 'Thesis is not currently assigned to any student' };
        }

        const deleteInvitationsSql = `
      DELETE FROM committee_invitation
      WHERE thesis_id = ?
    `;
        await conn.query(deleteInvitationsSql, [thesisId]);

        const updateSql = `
      UPDATE thesis
      SET 
        student_id = NULL,
        member1_id = NULL,
        member2_id = NULL,
        thesis_status = 'under-assignment'
      WHERE id = ? AND supervisor_id = ?
    `;
        const updateResult = await conn.query(updateSql, [thesisId, req.session.userId]);

        if (!updateResult || updateResult.affectedRows === 0) {
            await conn.rollback();
            conn.release();
            return { success: false, error: 'Failed to cancel assignment' };
        }

        await conn.commit();
        conn.release();

        return { success: true };

    } catch (err) {
        await conn.rollback();
        conn.release();
        console.error('Error in cancelThesisAssignment:', err);
        throw err;
    }
}

async function cancelActiveThesisAssignment(req, thesisId, assemblyNumber, assemblyYear) {
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        // 1. Update thesis to clear student/member assignments & record cancellation AP info
        const updateSql = `
    UPDATE thesis
    SET 
      student_id = NULL,
      member1_id = NULL,
      member2_id = NULL,
      thesis_status = 'under-assignment',
      cancellation_ap_number = ?,    
      cancellation_ap_year = ?,      
      cancellation_reason = ?,       
      cancellation_date = NOW()      
    WHERE id = ? AND supervisor_id = ?
  `;

        const logReason = `Unassigned by supervisor (Γ.Σ. ${assemblyNumber}/${assemblyYear})`;

        const updateResult = await conn.query(updateSql, [
            assemblyNumber,
            assemblyYear,
            logReason,
            thesisId,
            req.session.userId
        ]);

        if (!updateResult || updateResult.affectedRows === 0) {
            await conn.rollback();
            conn.release();
            return { success: false, error: 'Failed to cancel assignment' };
        }

        // 2. Insert into thesis_log
        const insertLogSql = `
    INSERT INTO thesis_log (thesis_id, user_id, user_role, action)
    VALUES (?, ?, 'supervisor', ?)
  `;
        await conn.query(insertLogSql, [thesisId, req.session.userId, logReason]);

        // 3. Commit transaction
        await conn.commit();
        conn.release();

        return { success: true, message: 'Assignment successfully canceled' };

    } catch (err) {
        await conn.rollback();
        conn.release();
        console.error(err);
        return { success: false, error: 'Unexpected error occurred' };
    }

}

module.exports = {
  getUnderAssignment,
  getRelevantThesis,
  searchStudents,
  getAvailableTopics,
  getTemporaryAssignments,
  assignThesisToStudent,
  getAssignmentDate,
  cancelThesisUnderAssignment,
  cancelActiveThesisAssignment
};