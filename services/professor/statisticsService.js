const pool = require('../../db/db');

// Function to get statistics for instructor (both supervised and committee member theses)
async function getInstructorStatistics(req) {
  const professorId = req.session.userId;

  // Query for supervised theses statistics
  const supervisedStatsQuery = `
    SELECT
      COUNT(*) as total_count,
      AVG(grade) as avg_grade,
      AVG(DATEDIFF(
        CASE
          WHEN thesis_status = 'completed' AND exam_datetime IS NOT NULL
          THEN exam_datetime
          ELSE CURRENT_TIMESTAMP
        END,
        submission_date
      )) as avg_completion_days
    FROM thesis
    WHERE supervisor_id = ?
      AND thesis_status IN ('completed', 'under-review', 'active')
  `;

  // Query for committee member theses statistics
  const committeeMemberStatsQuery = `
    SELECT
      COUNT(*) as total_count,
      AVG(grade) as avg_grade,
      AVG(DATEDIFF(
        CASE
          WHEN thesis_status = 'completed' AND exam_datetime IS NOT NULL
          THEN exam_datetime
          ELSE CURRENT_TIMESTAMP
        END,
        submission_date
      )) as avg_completion_days
    FROM thesis
    WHERE (member1_id = ? OR member2_id = ?)
      AND thesis_status IN ('completed', 'under-review', 'active')
  `;

  // Query for detailed breakdown by status for supervised theses
  const supervisedBreakdownQuery = `
    SELECT
      thesis_status,
      COUNT(*) as count
    FROM thesis
    WHERE supervisor_id = ?
    GROUP BY thesis_status
  `;

  // Query for detailed breakdown by status for committee member theses
  const committeeBreakdownQuery = `
    SELECT
      thesis_status,
      COUNT(*) as count
    FROM thesis
    WHERE (member1_id = ? OR member2_id = ?)
    GROUP BY thesis_status
  `;

  const conn = await pool.getConnection();
  try {
    // Execute all queries
    const [supervisedStats] = await conn.query(supervisedStatsQuery, [professorId]);
    const [committeeMemberStats] = await conn.query(committeeMemberStatsQuery, [professorId, professorId]);
    const supervisedBreakdown = await conn.query(supervisedBreakdownQuery, [professorId]);
    const committeeBreakdown = await conn.query(committeeBreakdownQuery, [professorId, professorId]);

    conn.release();

    return {
      supervised: {
        total_count: supervisedStats.total_count || 0,
        avg_grade: supervisedStats.avg_grade ? parseFloat(supervisedStats.avg_grade).toFixed(2) : null,
        avg_completion_days: supervisedStats.avg_completion_days ? Math.round(supervisedStats.avg_completion_days) : null,
        breakdown: supervisedBreakdown || []
      },
      committee_member: {
        total_count: committeeMemberStats.total_count || 0,
        avg_grade: committeeMemberStats.avg_grade ? parseFloat(committeeMemberStats.avg_grade).toFixed(2) : null,
        avg_completion_days: committeeMemberStats.avg_completion_days ? Math.round(committeeMemberStats.avg_completion_days) : null,
        breakdown: committeeBreakdown || []
      }
    };

  } catch (err) {
    conn.release();
    throw err;
  }
}

module.exports = {
  getInstructorStatistics
};