const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'second_db',
    port: process.env.DB_PORT || 5432,
    ssl: process.env.DB_SSL === 'true' // Optional for secure connections
});

pool.on('connect', () => {
    console.log('Successfully connected to PostgreSQL database.');
});

pool.on('error', (err) => {
    console.error('Database connection error:', err.stack);
    process.exit(-1);
});

// Define schema and seed data
const schemaSQL = `
CREATE TABLE IF NOT EXISTS department (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS role (
    id SERIAL PRIMARY KEY,
    title VARCHAR(30) UNIQUE NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INTEGER NOT NULL,
    FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE IF NOT EXISTS employee (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INTEGER NOT NULL,
    manager_id INTEGER,
    FOREIGN KEY (role_id) REFERENCES role(id),
    FOREIGN KEY (manager_id) REFERENCES employee(id)
);
`;

const seedSQL = `
INSERT INTO department (name)
VALUES ('Engineering'), ('Human Resources'), ('Sales')
ON CONFLICT (name) DO NOTHING;

INSERT INTO role (title, salary, department_id)
VALUES 
    ('Software Engineer', 120_000, 1),
    ('HR Manager', 80_000, 2),
    ('Sales Associate', 60_000, 3)
ON CONFLICT (title) DO NOTHING;

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
    ('John', 'Doe', 1, NULL),
    ('Roe', 'Wade', 2, 1),
    ('Jace', 'Smith', 3, 2)
ON CONFLICT DO NOTHING;
`;

// Queries
const queries = {
    getDepartments: async () => {
        const result = await pool.query('SELECT * FROM department');
        return result.rows;
    },
    getRoles: async () => {
        const result = await pool.query('SELECT * FROM role');
        return result.rows;
    },
    getEmployees: async () => {
        const result = await pool.query('SELECT * FROM employee');
        return result.rows;
    },
    addDepartment: async (name) => {
        const result = await pool.query('INSERT INTO department (name) VALUES ($1) RETURNING *', [name]);
        return result.rows[0];
    },
    addRole: async (title, salary, departmentId) => {
        const result = await pool.query(
            'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3) RETURNING *',
            [title, salary, departmentId]
        );
        return result.rows[0];
    },
    addEmployee: async (firstName, lastName, roleId, managerId) => {
        const result = await pool.query(
            'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [firstName, lastName, roleId, managerId]
        );
        return result.rows[0];
    },
};

// Initialize database
async function initializeDatabase() {
    try {
        console.log('Creating schema...');
        await pool.query(schemaSQL);
        console.log('Schema created.');

        console.log('Seeding data...');
        await pool.query(seedSQL);
        console.log('Database seeded.');

        console.log('Fetching data...');
        const departments = await queries.getDepartments();
        // console.log('Departments:', departments);

        const roles = await queries.getRoles();
        // console.log('Roles:', roles);

        const employees = await queries.getEmployees();
        // console.log('Employees:', employees);
    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        pool.end();
    }
}

initializeDatabase();
