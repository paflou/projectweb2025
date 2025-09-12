require('dotenv').config(); // Load env variables
const pool = require("./db");

async function removeExaminationReportColumns() {
  const conn = await pool.getConnection();
  try {
    console.log('Removing examination report columns...');
    
    // Remove examination report columns
    const sql = `
      ALTER TABLE thesis 
      DROP COLUMN IF EXISTS examination_report_generated,
      DROP COLUMN IF EXISTS examination_report_date
    `;
    
    const rows = await conn.query(sql);
    console.log('Examination report columns removed successfully:', rows);
    
    conn.release();
    console.log('Cleanup completed.');
    
  } catch (error) {
    conn.release();
    console.error('Cleanup failed:', error);
    
    // Check if columns don't exist
    if (error.message && error.message.includes("check that column/key exists")) {
      console.log('Columns already removed - cleanup not needed.');
    } else {
      throw error;
    }
  }
}

// Run cleanup if this file is executed directly
if (require.main === module) {
  removeExaminationReportColumns()
    .then(() => {
      console.log('Cleanup process completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Cleanup process failed:', error);
      process.exit(1);
    });
}

module.exports = { removeExaminationReportColumns };
