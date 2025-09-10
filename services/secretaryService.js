const pool = require("../db/db");

/**
 * Service for secretary thesis management operations
 */

/**
 * Get all active and under-review theses for secretary view
 * @returns {Array} Array of thesis objects with details
 */
async function getActiveAndUnderReviewTheses() {
  const sql = `
    SELECT 
      t.id,
      t.title,
      t.description,
      t.thesis_status,
      t.submission_date,
      t.exam_datetime,
      t.exam_mode,
      t.exam_location,
      t.grade,
      
      -- Student information
      CONCAT(student.name, ' ', student.surname) AS student_name,
      student.email AS student_email,
      st.student_number,
      
      -- Supervisor information
      CONCAT(supervisor.name, ' ', supervisor.surname) AS supervisor_name,
      supervisor.email AS supervisor_email,
      prof_supervisor.topic AS supervisor_topic,
      
      -- Committee member 1 information
      CONCAT(member1.name, ' ', member1.surname) AS member1_name,
      member1.email AS member1_email,
      prof_member1.topic AS member1_topic,
      
      -- Committee member 2 information
      CONCAT(member2.name, ' ', member2.surname) AS member2_name,
      member2.email AS member2_email,
      prof_member2.topic AS member2_topic,
      
      -- Calculate time elapsed since assignment (when status became active)
      DATEDIFF(NOW(), t.submission_date) AS days_since_submission
      
    FROM thesis t
    
    -- Join with student information
    LEFT JOIN user student ON t.student_id = student.id
    LEFT JOIN student st ON t.student_id = st.id
    
    -- Join with supervisor information
    LEFT JOIN user supervisor ON t.supervisor_id = supervisor.id
    LEFT JOIN professor prof_supervisor ON t.supervisor_id = prof_supervisor.id
    
    -- Join with committee member 1 information
    LEFT JOIN user member1 ON t.member1_id = member1.id
    LEFT JOIN professor prof_member1 ON t.member1_id = prof_member1.id
    
    -- Join with committee member 2 information
    LEFT JOIN user member2 ON t.member2_id = member2.id
    LEFT JOIN professor prof_member2 ON t.member2_id = prof_member2.id
    
    WHERE t.thesis_status IN ('active', 'under-review')
    ORDER BY t.thesis_status, t.submission_date DESC
  `;

  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(sql);
    conn.release();
    
    // Process the results to add additional calculated fields
    return rows.map(thesis => ({
      ...thesis,
      // Convert BigInt values to strings for JSON serialization
      student_number: thesis.student_number ? thesis.student_number.toString() : null,
      days_since_submission: thesis.days_since_submission || 0,
      
      // Format committee members array
      committee_members: [
        thesis.member1_name ? {
          name: thesis.member1_name,
          email: thesis.member1_email,
          topic: thesis.member1_topic
        } : null,
        thesis.member2_name ? {
          name: thesis.member2_name,
          email: thesis.member2_email,
          topic: thesis.member2_topic
        } : null
      ].filter(member => member !== null),
      
      // Status display text
      status_text: getStatusText(thesis.thesis_status),
      status_class: getStatusClass(thesis.thesis_status)
    }));
    
  } catch (err) {
    conn.release();
    console.error('Error in getActiveAndUnderReviewTheses:', err);
    throw err;
  }
}

/**
 * Get detailed information for a specific thesis
 * @param {number} thesisId - The thesis ID
 * @returns {Object} Detailed thesis information
 */
async function getThesisDetails(thesisId) {
  const sql = `
    SELECT 
      t.id,
      t.title,
      t.description,
      t.thesis_status,
      t.submission_date,
      t.exam_datetime,
      t.exam_mode,
      t.exam_location,
      t.grade,
      t.pdf,
      t.draft,
      t.final_repository_link,
      
      -- Student information
      CONCAT(student.name, ' ', student.surname) AS student_name,
      student.email AS student_email,
      student.landline AS student_landline,
      student.mobile AS student_mobile,
      st.student_number,
      st.street,
      st.street_number,
      st.city,
      st.postcode,
      st.father_name,
      
      -- Supervisor information
      CONCAT(supervisor.name, ' ', supervisor.surname) AS supervisor_name,
      supervisor.email AS supervisor_email,
      supervisor.landline AS supervisor_landline,
      supervisor.mobile AS supervisor_mobile,
      prof_supervisor.topic AS supervisor_topic,
      prof_supervisor.department AS supervisor_department,
      prof_supervisor.university AS supervisor_university,
      
      -- Committee member 1 information
      CONCAT(member1.name, ' ', member1.surname) AS member1_name,
      member1.email AS member1_email,
      member1.landline AS member1_landline,
      member1.mobile AS member1_mobile,
      prof_member1.topic AS member1_topic,
      prof_member1.department AS member1_department,
      prof_member1.university AS member1_university,
      
      -- Committee member 2 information
      CONCAT(member2.name, ' ', member2.surname) AS member2_name,
      member2.email AS member2_email,
      member2.landline AS member2_landline,
      member2.mobile AS member2_mobile,
      prof_member2.topic AS member2_topic,
      prof_member2.department AS member2_department,
      prof_member2.university AS member2_university,
      
      -- Calculate time elapsed
      DATEDIFF(NOW(), t.submission_date) AS days_since_submission
      
    FROM thesis t
    
    -- Join with student information
    LEFT JOIN user student ON t.student_id = student.id
    LEFT JOIN student st ON t.student_id = st.id
    
    -- Join with supervisor information
    LEFT JOIN user supervisor ON t.supervisor_id = supervisor.id
    LEFT JOIN professor prof_supervisor ON t.supervisor_id = prof_supervisor.id
    
    -- Join with committee member 1 information
    LEFT JOIN user member1 ON t.member1_id = member1.id
    LEFT JOIN professor prof_member1 ON t.member1_id = prof_member1.id
    
    -- Join with committee member 2 information
    LEFT JOIN user member2 ON t.member2_id = member2.id
    LEFT JOIN professor prof_member2 ON t.member2_id = prof_member2.id
    
    WHERE t.id = ?
  `;

  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(sql, [thesisId]);
    conn.release();
    
    if (rows.length === 0) {
      return null;
    }
    
    const thesis = rows[0];
    
    // Process and format the result
    return {
      ...thesis,
      // Convert BigInt values to strings
      student_number: thesis.student_number ? thesis.student_number.toString() : null,
      student_landline: thesis.student_landline ? thesis.student_landline.toString() : null,
      student_mobile: thesis.student_mobile ? thesis.student_mobile.toString() : null,
      supervisor_landline: thesis.supervisor_landline ? thesis.supervisor_landline.toString() : null,
      supervisor_mobile: thesis.supervisor_mobile ? thesis.supervisor_mobile.toString() : null,
      member1_landline: thesis.member1_landline ? thesis.member1_landline.toString() : null,
      member1_mobile: thesis.member1_mobile ? thesis.member1_mobile.toString() : null,
      member2_landline: thesis.member2_landline ? thesis.member2_landline.toString() : null,
      member2_mobile: thesis.member2_mobile ? thesis.member2_mobile.toString() : null,
      postcode: thesis.postcode ? thesis.postcode.toString() : null,
      street_number: thesis.street_number ? thesis.street_number.toString() : null,
      
      days_since_submission: thesis.days_since_submission || 0,
      
      // Format committee members
      committee_members: [
        thesis.member1_name ? {
          name: thesis.member1_name,
          email: thesis.member1_email,
          landline: thesis.member1_landline ? thesis.member1_landline.toString() : null,
          mobile: thesis.member1_mobile ? thesis.member1_mobile.toString() : null,
          topic: thesis.member1_topic,
          department: thesis.member1_department,
          university: thesis.member1_university
        } : null,
        thesis.member2_name ? {
          name: thesis.member2_name,
          email: thesis.member2_email,
          landline: thesis.member2_landline ? thesis.member2_landline.toString() : null,
          mobile: thesis.member2_mobile ? thesis.member2_mobile.toString() : null,
          topic: thesis.member2_topic,
          department: thesis.member2_department,
          university: thesis.member2_university
        } : null
      ].filter(member => member !== null),
      
      // Status information
      status_text: getStatusText(thesis.thesis_status),
      status_class: getStatusClass(thesis.thesis_status)
    };
    
  } catch (err) {
    conn.release();
    console.error('Error in getThesisDetails:', err);
    throw err;
  }
}

/**
 * Get status display text
 * @param {string} status - Thesis status
 * @returns {string} Display text in Greek
 */
function getStatusText(status) {
  const statusMap = {
    'under-assignment': 'Υπό Ανάθεση',
    'active': 'Ενεργή',
    'under-review': 'Υπό Εξέταση',
    'completed': 'Ολοκληρωμένη',
    'canceled': 'Ακυρωμένη'
  };
  return statusMap[status] || status;
}

/**
 * Get status CSS class
 * @param {string} status - Thesis status
 * @returns {string} CSS class for styling
 */
function getStatusClass(status) {
  const classMap = {
    'under-assignment': 'bg-warning text-dark',
    'active': 'bg-success',
    'under-review': 'bg-info',
    'completed': 'bg-primary',
    'canceled': 'bg-danger'
  };
  return classMap[status] || 'bg-secondary';
}

/**
 * Record AP number for active thesis
 * @param {number} thesisId - Thesis ID
 * @param {string} apNumber - AP number from General Assembly
 * @param {number} apYear - Year of the General Assembly decision
 * @returns {Object} Success/error result
 */
async function recordApNumber(thesisId, apNumber, apYear) {
  const conn = await pool.getConnection();

  try {
    // Check if thesis exists and is active
    const checkSql = `
      SELECT id, thesis_status, title
      FROM thesis
      WHERE id = ? AND thesis_status = 'active'
    `;
    const [thesis] = await conn.query(checkSql, [thesisId]);

    if (!thesis) {
      conn.release();
      return { success: false, error: 'Thesis not found or not in active status' };
    }

    // Update thesis with AP number
    const updateSql = `
      UPDATE thesis
      SET ap_number = ?, ap_year = ?
      WHERE id = ?
    `;
    await conn.query(updateSql, [apNumber, apYear, thesisId]);

    // Log the action
    const logSql = `
      INSERT INTO thesis_log (thesis_id, user_role, action)
      VALUES (?, 'secretary', 'ap_number_recorded')
    `;
    await conn.query(logSql, [thesisId]);

    conn.release();
    return { success: true, message: 'AP number recorded successfully' };

  } catch (err) {
    conn.release();
    console.error('Error in recordApNumber:', err);
    throw err;
  }
}

/**
 * Cancel thesis assignment
 * @param {number} thesisId - Thesis ID
 * @param {string} cancellationApNumber - AP number for cancellation decision
 * @param {number} cancellationApYear - Year of cancellation decision
 * @param {string} cancellationReason - Reason for cancellation
 * @returns {Object} Success/error result
 */
async function cancelThesisAssignment(thesisId, cancellationApNumber, cancellationApYear, cancellationReason) {
  const conn = await pool.getConnection();

  try {
    // Check if thesis exists and is active
    const checkSql = `
      SELECT id, thesis_status, title, student_id
      FROM thesis
      WHERE id = ? AND thesis_status = 'active'
    `;
    const [thesis] = await conn.query(checkSql, [thesisId]);

    if (!thesis) {
      conn.release();
      return { success: false, error: 'Thesis not found or not in active status' };
    }

    // Update thesis status to canceled and record cancellation details
    const updateSql = `
      UPDATE thesis
      SET thesis_status = 'canceled',
          cancellation_ap_number = ?,
          cancellation_ap_year = ?,
          cancellation_reason = ?,
          cancellation_date = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await conn.query(updateSql, [cancellationApNumber, cancellationApYear, cancellationReason, thesisId]);

    // Cancel any pending committee invitations
    const cancelInvitationsSql = `
      UPDATE committee_invitation
      SET status = 'cancelled'
      WHERE thesis_id = ? AND status = 'pending'
    `;
    await conn.query(cancelInvitationsSql, [thesisId]);

    // Log the action
    const logSql = `
      INSERT INTO thesis_log (thesis_id, user_role, action)
      VALUES (?, 'secretary', 'thesis_cancelled')
    `;
    await conn.query(logSql, [thesisId]);

    conn.release();
    return { success: true, message: 'Thesis assignment cancelled successfully' };

  } catch (err) {
    conn.release();
    console.error('Error in cancelThesisAssignment:', err);
    throw err;
  }
}

/**
 * Change thesis status from under-review to completed
 * @param {number} thesisId - Thesis ID
 * @returns {Object} Success/error result
 */
async function markThesisCompleted(thesisId) {
  const conn = await pool.getConnection();

  try {
    // Check if thesis exists, is under-review, has grade and repository link
    const checkSql = `
      SELECT id, thesis_status, title, grade, final_repository_link
      FROM thesis
      WHERE id = ? AND thesis_status = 'under-review'
    `;
    const [thesis] = await conn.query(checkSql, [thesisId]);

    if (!thesis) {
      conn.release();
      return { success: false, error: 'Thesis not found or not in under-review status' };
    }

    if (!thesis.grade || thesis.grade <= 0) {
      conn.release();
      return { success: false, error: 'Thesis must have a grade recorded before completion' };
    }

    if (!thesis.final_repository_link) {
      conn.release();
      return { success: false, error: 'Thesis must have repository link (Nemertes) before completion' };
    }

    // Update thesis status to completed
    const updateSql = `
      UPDATE thesis
      SET thesis_status = 'completed'
      WHERE id = ?
    `;
    await conn.query(updateSql, [thesisId]);

    // Log the action
    const logSql = `
      INSERT INTO thesis_log (thesis_id, user_role, action)
      VALUES (?, 'secretary', 'thesis_completed')
    `;
    await conn.query(logSql, [thesisId]);

    conn.release();
    return { success: true, message: 'Thesis marked as completed successfully' };

  } catch (err) {
    conn.release();
    console.error('Error in markThesisCompleted:', err);
    throw err;
  }
}

module.exports = {
  getActiveAndUnderReviewTheses,
  getThesisDetails,
  recordApNumber,
  cancelThesisAssignment,
  markThesisCompleted
};
