require('dotenv').config(); // Load env variables
const pool = require("./db");
const fs = require('fs').promises;
const path = require('path');

const migrationFilePath = path.join(__dirname, 'migrate_thesis_management.sql');

async function runMigration() {
  const conn = await pool.getConnection();
  try {
    console.log('Running thesis management migration...');
    
    // Read migration SQL
    const sql = await fs.readFile(migrationFilePath, 'utf-8');
    console.log('Migration SQL:', sql);
    
    // Execute the migration
    const rows = await conn.query(sql);
    console.log('Migration completed successfully:', rows);
    
    conn.release();
    console.log('Thesis management fields added to database.');
    
  } catch (error) {
    conn.release();
    console.error('Migration failed:', error);
    
    // Check if columns already exist
    if (error.message && error.message.includes('Duplicate column name')) {
      console.log('Columns already exist - migration not needed.');
    } else {
      throw error;
    }
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('Migration process completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration process failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };
