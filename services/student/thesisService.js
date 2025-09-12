const pool = require("../../db/db");


// Save filename to DB
async function saveFileNameToDB(userId, filename) {
  const sql = `
    UPDATE thesis
    SET draft = ?
    WHERE student_id = ?
  `;
  const params = [filename, userId];

  const conn = await pool.getConnection();
  try {
    await conn.query(sql, params);
  } finally {
    conn.release();
  }
}

// Function to get student's thesis information
async function getThesisInfo(req) {
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
      t.final_repository_link,
      t.pdf,
      t.draft,
      t.grade,
      u.name as supervisor_name,
      u.surname as supervisor_surname
    FROM thesis t
    INNER JOIN professor p ON t.supervisor_id = p.id
    INNER JOIN user u ON p.id = u.id
    WHERE t.student_id = ?
  `;

  const params = [req.session.userId];
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(sql, params);
    conn.release();
    return rows.length > 0 ? rows[0] : null;
  } catch (err) {
    conn.release();
    throw err;
  }
}

// Function to get detailed thesis information with committee members and time elapsed
async function getDetailedThesisInfo(req) {
  const sql = `
    SELECT
      t.id,
      t.title,
      t.description,
      t.thesis_status,
      t.submission_date,
      t.pdf,
      t.grade,
      t.member1_id,
      t.member2_id,
      u.name as supervisor_name,
      u.surname as supervisor_surname,
      p.topic as supervisor_topic,
      p.department as supervisor_department
    FROM thesis t
    INNER JOIN professor p ON t.supervisor_id = p.id
    INNER JOIN user u ON p.id = u.id
    WHERE t.student_id = ?
  `;

  const params = [req.session.userId];
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(sql, params);

    if (rows.length === 0) {
      conn.release();
      return null;
    }

    const thesis = rows[0];

    // Get committee members from both committee_invitation table and thesis table
    let committeeRows = [];

    // First, try to get from thesis table (member1_id, member2_id)
    if (thesis.member1_id || thesis.member2_id) {
      const membersSql = `
        SELECT
          u1.name as member1_name,
          u1.surname as member1_surname,
          p1.topic as member1_topic,
          p1.department as member1_department,
          u2.name as member2_name,
          u2.surname as member2_surname,
          p2.topic as member2_topic,
          p2.department as member2_department
        FROM thesis t
        LEFT JOIN professor p1 ON t.member1_id = p1.id
        LEFT JOIN user u1 ON p1.id = u1.id
        LEFT JOIN professor p2 ON t.member2_id = p2.id
        LEFT JOIN user u2 ON p2.id = u2.id
        WHERE t.id = ?
      `;

      const membersResult = await conn.query(membersSql, [thesis.id]);
      if (membersResult.length > 0) {
        const members = membersResult[0];

        // Add member1 if exists
        if (members.member1_name) {
          committeeRows.push({
            name: members.member1_name,
            surname: members.member1_surname,
            topic: members.member1_topic,
            department: members.member1_department,
            status: 'accepted'
          });
        }

        // Add member2 if exists
        if (members.member2_name) {
          committeeRows.push({
            name: members.member2_name,
            surname: members.member2_surname,
            topic: members.member2_topic,
            department: members.member2_department,
            status: 'accepted'
          });
        }
      }
    } else {
      // Fallback to committee_invitation table
      const committeeSql = `
        SELECT
          ci.status,
          u.name,
          u.surname,
          p.topic,
          p.department,
          ci.sent_at
        FROM committee_invitation ci
        INNER JOIN professor p ON ci.professor_id = p.id
        INNER JOIN user u ON p.id = u.id
        WHERE ci.thesis_id = ? AND ci.status = 'accepted'
        ORDER BY ci.sent_at ASC
      `;

      committeeRows = await conn.query(committeeSql, [thesis.id]);
    }

    // Calculate time elapsed since assignment (when thesis became 'active')
    let timeElapsed = null;
    let assignmentDate = null;

    if (thesis.thesis_status === 'active' || thesis.thesis_status === 'under-review') {
      // For active/under-review theses, find when it became active
      // This would be when the 2nd committee member accepted
      const statusSql = `
        SELECT sent_at
        FROM committee_invitation
        WHERE thesis_id = ? AND status = 'accepted'
        ORDER BY sent_at ASC
        LIMIT 1 OFFSET 1
      `;

      const statusRows = await conn.query(statusSql, [thesis.id]);
      if (statusRows.length > 0) {
        assignmentDate = statusRows[0].sent_at;
        const now = new Date();
        const assigned = new Date(assignmentDate);
        const diffTime = Math.abs(now - assigned);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        timeElapsed = diffDays;
      }
    }

    conn.release();

    return {
      ...thesis,
      committee_members: committeeRows,
      assignment_date: assignmentDate,
      time_elapsed_days: timeElapsed
    };

  } catch (err) {
    conn.release();
    throw err;
  }
}


// Function to add material link
async function addMaterialLink(req, title, url) {
  const conn = await pool.getConnection();

  try {
    const thesisInfo = await getThesisInfo(req);
    if (!thesisInfo) {
      conn.release();
      return { success: false, error: 'No thesis found for student' };
    }

    const sql = `
      INSERT INTO additional_thesis_material (thesis_id, url)
      VALUES (?, ?)
    `;
    const result = await conn.query(sql, [thesisInfo.id, url]);
    const linkId = result.insertId;
    conn.release();
    return { success: true, linkId };
  } catch (err) {
    conn.release();
    throw err;
  }
}


// Function to save examination details
async function saveExamDetails(req, examDetails) {
  const conn = await pool.getConnection();

  try {
    const thesisInfo = await getThesisInfo(req);
    if (!thesisInfo) {
      conn.release();
      return { success: false, error: 'No thesis found for student' };
    }
    const sql = `
      UPDATE thesis
      SET exam_datetime = ?, exam_mode = ?, exam_location = ?
      WHERE id = ?
    `;

    const examDatetime = `${examDetails.examDate} ${examDetails.examTime}:00`; // "YYYY-MM-DD HH:MM:SS"
    console.log("Saving exam details with datetime:", examDatetime);
    const params = [
      examDatetime,
      examDetails.examType,
      examDetails.examLocation,
      thesisInfo.id
    ];
    await conn.query(sql, params);

    conn.release();
    return { success: true };

  } catch (err) {
    conn.release();
    throw err;
  }
}


// Function to save repository link
async function saveRepositoryLink(req, repositoryLink) {
  const conn = await pool.getConnection();

  try {
    const thesisInfo = await getThesisInfo(req);
    if (!thesisInfo) {
      conn.release();
      return { success: false, error: 'No thesis found for student' };
    }

    const sql = `
      UPDATE thesis
      SET final_repository_link = ?
      WHERE id = ?
    `;

    const params = [repositoryLink, thesisInfo.id];
    await conn.query(sql, params);
    conn.release();
    return { success: true };

  } catch (err) {
    conn.release();
    throw err;
  }
}


module.exports = {
  saveFileNameToDB,
  getThesisInfo,
  getDetailedThesisInfo,
  addMaterialLink,
  saveExamDetails,
  saveRepositoryLink
};