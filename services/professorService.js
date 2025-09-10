const pool = require("../db/db");

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

    // 1. Check if thesis exists and is active
    const checkThesisSql = `
      SELECT id, title, student_id
      FROM thesis
      WHERE id = ? AND supervisor_id = ? AND thesis_status = 'active'
    `;
    const thesisRows = await conn.query(checkThesisSql, [thesisId, req.session.userId]);
    console.log('DEBUG checkThesisSql result:', thesisRows);

    if (!thesisRows || thesisRows.length === 0) {
      await conn.rollback();
      conn.release();
      return { success: false, error: 'Thesis not found or not available for cancellation' };
    }

    const thesis = thesisRows[0];

    if (thesis.student_id === null) {
      await conn.rollback();
      conn.release();
      return { success: false, error: 'Thesis is not currently assigned to any student' };
    }

    // 2. Delete committee invitations
    const deleteInvitationsSql = `
      DELETE FROM committee_invitation
      WHERE thesis_id = ?
    `;
    await conn.query(deleteInvitationsSql, [thesisId]);

    // 3. Update thesis to unassign student and reset members
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

    // 4. Insert a log entry in thesis_log
    const insertLogSql = `
      INSERT INTO thesis_log (thesis_id, user_id, user_role, action)
      VALUES (?, ?, 'supervisor', ?)
    `;
    const logReason = `Unassigned by supervisor (Γ.Σ. ${assemblyNumber}/${assemblyYear})`;
    console.log(logReason)
    await conn.query(insertLogSql, [thesisId, req.session.userId, logReason]);

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

async function deleteThesis(thesisId, supervisorId) {
  const sql = `
    DELETE FROM thesis
    WHERE id = ? AND supervisor_id = ?
  `;
  const params = [thesisId, supervisorId];

  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(sql, params); // Destructure result
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
    console.log(result)
    return result;
  } finally {
    conn.release();
  }
}

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



module.exports = {
  insertThesisToDB,
  getUnderAssignment,
  getRelevantThesis,
  searchStudents,
  getAvailableTopics,
  assignThesisToStudent,
  getTemporaryAssignments,
  cancelActiveThesisAssignment,
  cancelThesisUnderAssignment,
  updateThesis,
  getProfessorInvitations,
  acceptInvitation,
  rejectInvitation,
  leaveComittee,
  getThesisTimeline,
  deleteThesis,
  getSpecificThesis,
  getThesisInvitations,
  getProfessorNotesForThesis,
  addNoteForThesis,
  editNote,
  deleteNote,
  getProfessorRole,
  getAssignmentDate,
  markUnderReview
};

