const { Pool } = require('pg');
const inquirer = require('inquirer');
require('dotenv').config();

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'infiniteloop',
    database: process.env.DB_NAME || 'second_db',
    port: process.env.DB_PORT || 5432,
    ssl: process.env.DB_SSL === 'true'
});

pool.on('connect', () => {
    console.log('Successfully connected to PostgreSQL database.');
});

pool.on('error', (err) => {
    console.error('Database connection error:', err.stack);
    process.exit(-1);
});

// Queries
const queries = {
    getDepartments: async () => {
        const result = await pool.query('SELECT * FROM department');
        return result.rows;
    },
    getRoles: async () => {
        const result = await pool.query(
            'SELECT role.id, role.title, role.salary, department.name AS department FROM role JOIN department ON role.department_id = department.id'
        );
        return result.rows;
    },
    getEmployees: async () => {
        const result = await pool.query(
            `SELECT 
                employee.id, 
                employee.first_name, 
                employee.last_name, 
                role.title, 
                department.name AS department, 
                role.salary, 
                COALESCE(manager.first_name || ' ' || manager.last_name, 'None') AS manager
            FROM employee
            LEFT JOIN role ON employee.role_id = role.id
            LEFT JOIN department ON role.department_id = department.id
            LEFT JOIN employee AS manager ON employee.manager_id = manager.id`
        );
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
    updateEmployeeRole: async (employeeId, newRoleId) => {
        const result = await pool.query('UPDATE employee SET role_id = $1 WHERE id = $2 RETURNING *', [newRoleId, employeeId]);
        return result.rows[0];
    }
};

// Menu prompts
async function mainMenu() {
    const { action } = await inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            'View All Departments',
            'View All Roles',
            'View All Employees',
            'Add a Department',
            'Add a Role',
            'Add an Employee',
            'Update an Employee Role',
            'Exit'
        ]
    });

    switch (action) {
        case 'View All Departments':
            await viewAllDepartments();
            break;
        case 'View All Roles':
            await viewAllRoles();
            break;
        case 'View All Employees':
            await viewAllEmployees();
            break;
        case 'Add a Department':
            await addDepartment();
            break;
        case 'Add a Role':
            await addRole();
            break;
        case 'Add an Employee':
            await addEmployee();
            break;
        case 'Update an Employee Role':
            await updateEmployeeRole();
            break;
        case 'Exit':
            console.log('Goodbye!');
            pool.end();
            process.exit(0);
    }
    await mainMenu();
}

// Functions for menu options
async function viewAllDepartments() {
    const departments = await queries.getDepartments();
    console.table(departments);
}

async function viewAllRoles() {
    const roles = await queries.getRoles();
    console.table(roles);
}

async function viewAllEmployees() {
    const employees = await queries.getEmployees();
    console.table(employees);
}

async function addDepartment() {
    const { name } = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'Enter the name of the department:'
    });
    const department = await queries.addDepartment(name);
    console.log('Department added:', department);
}

async function addRole() {
    const departments = await queries.getDepartments();
    const { title, salary, departmentId } = await inquirer.prompt([
        { type: 'input', name: 'title', message: 'Enter the title of the role:' },
        { type: 'input', name: 'salary', message: 'Enter the salary for the role:' },
        {
            type: 'list',
            name: 'departmentId',
            message: 'Select the department for the role:',
            choices: departments.map((d) => ({ name: d.name, value: d.id }))
        }
    ]);
    const role = await queries.addRole(title, salary, departmentId);
    console.log('Role added:', role);
}

async function addEmployee() {
    const roles = await queries.getRoles();
    const employees = await queries.getEmployees();

    const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
        { type: 'input', name: 'firstName', message: "Enter the employee's first name:" },
        { type: 'input', name: 'lastName', message: "Enter the employee's last name:" },
        {
            type: 'list',
            name: 'roleId',
            message: "Select the employee's role:",
            choices: roles.map((r) => ({ name: r.title, value: r.id }))
        },
        {
            type: 'list',
            name: 'managerId',
            message: "Select the employee's manager:",
            choices: [{ name: 'None', value: null }].concat(
                employees.map((e) => ({ name: `${e.first_name} ${e.last_name}`, value: e.id }))
            )
        }
    ]);
    const employee = await queries.addEmployee(firstName, lastName, roleId, managerId);
    console.log('Employee added:', employee);
}

async function updateEmployeeRole() {
    const employees = await queries.getEmployees();
    const roles = await queries.getRoles();

    const { employeeId, newRoleId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'employeeId',
            message: 'Select the employee to update:',
            choices: employees.map((e) => ({ name: `${e.first_name} ${e.last_name}`, value: e.id }))
        },
        {
            type: 'list',
            name: 'newRoleId',
            message: "Select the employee's new role:",
            choices: roles.map((r) => ({ name: r.title, value: r.id }))
        }
    ]);
    const employee = await queries.updateEmployeeRole(employeeId, newRoleId);
    console.log('Employee role updated:', employee);
}

// Start application
mainMenu().catch((err) => console.error('Application error:', err));
