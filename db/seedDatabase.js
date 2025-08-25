require('dotenv').config(); // Load env variables
const pool = require("./db");
const mariadb = require('mariadb');
const fs = require('fs').promises;
const path = require('path');

const createFilePath = path.join(__dirname, 'create.sql'); // __dirname = script folder
const insertFilePath = path.join(__dirname, 'insert.sql'); // __dirname = script folder

async function seedDatabase() {
  const conn = await pool.getConnection();
  try {
    // Create create query
    let sql = await fs.readFile(createFilePath, 'utf-8');
    console.log(sql);
    // Execute the query
    let rows = await conn.query(sql);
    console.log(rows); // Logs the result of the create query
    // Create insert query

    sql = await fs.readFile(insertFilePath, 'utf-8')
    console.log(sql);
    // Execute the query
    rows = await conn.query(sql);
    console.log(rows); // Logs the result of the insert query
    conn.release();

    // Return the first row if found, otherwise null
    if (rows.length > 0) {
      return rows[0];
    } else {
      return null;
    }
  } catch (err) {
    // Release the connection and propagate the error
    conn.release();
    throw err;
  }
  finally {
    if (conn) conn.release(); // Ensure the connection is released
    console.log("\nSuccessfully seeded the database. \n You can now run the server with 'npm start' or 'npm run dev'.");
    process.exit(0);

  }
}

seedDatabase();