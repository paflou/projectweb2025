require('dotenv').config(); // Load env variables

const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '5')
});


module.exports = pool;
