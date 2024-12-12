const pool = require('../db/db'); // Adjust the path if needed

(async () => {
    try {
        const res = await pool.query('SELECT NOW()'); // Simple query to test connection
        console.log('Database time:', res.rows[0]);
    } catch (err) {
        console.error('Error connecting to the database:', err.message);
    } finally {
        await pool.end(); // Close the connection pool
    }
})();
