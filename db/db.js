const { Pool } = require('pg');
require('dotenv').config(); // Load environment variables from the .env file

// Create a new instance of Pool with environment variables
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost', // Default to localhost if DB_HOST is not set
    user: process.env.DB_USER,               // PostgreSQL user
    password: process.env.DB_PASSWORD,       // PostgreSQL password
    database: process.env.DB_NAME,           // Database name
    port: process.env.DB_PORT || 5432,       // Default to 5432 if DB_PORT is not set
    ssl: process.env.DB_SSL === 'true'       // Enable SSL if DB_SSL is set to 'true'
});

// Event listener for successful connection
pool.on('connect', () => {
    console.log('Successfully connected to the PostgreSQL database.');
});

// Event listener for errors
pool.on('error', (err) => {
    console.error('Unexpected error on PostgreSQL client:', err.stack);
    process.exit(-1); // Exit process if there is a connection error
});

module.exports = pool;
