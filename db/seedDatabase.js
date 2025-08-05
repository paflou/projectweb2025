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
    let sql = await fs.readFile(createFilePath, 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(data);
    })
    // Execute the query
    let rows = await conn.query(sql);
    
    // Create insert query
    sql = await fs.readFile(insertFilePath, 'utf-8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(data);
    })

    // Execute the query
    rows = await conn.query(sql);
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
}

seedDatabase();