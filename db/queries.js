const pool = require('./db'); // Ensure this path is correct and db.js exists

// Fetch all departments
const getDepartments = async () => {
    const result = await pool.query('SELECT * FROM department');
    return result.rows;
};

// Fetch all roles
const getRoles = async () => {
    const result = await pool.query('SELECT * FROM role');
    return result.rows;
};

// Fetch all employees
const getEmployees = async () => {
    const result = await pool.query('SELECT * FROM employee');
    return result.rows;
};

// Add a new department
const addDepartment = async (name) => {
    await pool.query('INSERT INTO department (name) VALUES ($1)', [name]);
};

// Add a new role
const addRole = async (title, salary, department_id) => {
    await pool.query(
        'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)',
        [title, salary, department_id]
    );
};

// Add a new employee
const addEmployee = async (firstName, lastName, role_id, manager_id) => {
    await pool.query(
        'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
        [firstName, lastName, role_id, manager_id]
    );
};

module.exports = {
    getDepartments,
    getRoles,
    getEmployees,
    addDepartment,
    addRole,
    addEmployee,
};
