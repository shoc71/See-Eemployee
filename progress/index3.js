const { Pool } = require('pg');
const inquirer = require('inquirer');
require('dotenv').config();

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'first_db',
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
        // console.log('Fetching all departments...');
        const result = await pool.query('SELECT * FROM department');
        // console.log('Departments fetched:', result.rows);
        return result.rows;
    },
    getRoles: async () => {
        // console.log('Fetching all roles...');
        const result = await pool.query(
            'SELECT role.id, role.title, role.salary, department.name AS department FROM role JOIN department ON role.department_id = department.id'
        );
        // console.log('Roles fetched:', result.rows);
        return result.rows;
    },
    getEmployees: async () => {
        // console.log('Fetching all employees...');
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
        // console.log('Employees fetched:', result.rows);
        return result.rows;
    },
    addDepartment: async (name) => {
        console.log('Adding a department with name:', name);
        const result = await pool.query('INSERT INTO department (name) VALUES ($1) RETURNING *', [name]);
        console.log('Department added:', result.rows[0]);
        return result.rows[0];
    },
    addRole: async (title, salary, departmentId) => {
        console.log('Adding a role with title, salary, and departmentId:', title, salary, departmentId);
        const result = await pool.query(
            'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3) RETURNING *',
            [title, salary, departmentId]
        );
        console.log('Role added:', result.rows[0]);
        return result.rows[0];
    },
    addEmployee: async (firstName, lastName, roleId, managerId) => {
        console.log('Adding an employee with firstName, lastName, roleId, and managerId:', firstName, lastName, roleId, managerId);
        const result = await pool.query(
            'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [firstName, lastName, roleId, managerId]
        );
        console.log('Employee added:', result.rows[0]);
        return result.rows[0];
    },
    updateEmployeeRole: async (employeeId, newRoleId) => {
        console.log('Updating employee role with employeeId and newRoleId:', employeeId, newRoleId);
        const result = await pool.query('UPDATE employee SET role_id = $1 WHERE id = $2 RETURNING *', [newRoleId, employeeId]);
        console.log('Employee role updated:', result.rows[0]);
        return result.rows[0];
    }
};

// Menu prompts
async function mainMenu() {
    console.log('Displaying main menu...');
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

    console.log('Selected action:', action);
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
    // console.log('Viewing all departments...');
    const departments = await queries.getDepartments();
    console.table(departments);
}

async function viewAllRoles() {
    // console.log('Viewing all roles...');
    const roles = await queries.getRoles();
    console.table(roles);
}

async function viewAllEmployees() {
    // console.log('Viewing all employees...');
    const employees = await queries.getEmployees();
    console.table(employees);
}

async function addDepartment() {
    console.log('Prompting user to add a department...');
    const { name } = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'Enter the name of the department:'
    });
    console.log('User entered department name:', name);
    const department = await queries.addDepartment(name);
    console.log('Department added:', department);
}

async function addRole() {
    console.log('Prompting user to add a role...');
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
    console.log('User entered role details:', { title, salary, departmentId });
    const role = await queries.addRole(title, salary, departmentId);
    console.log('Role added:', role);
}

async function addEmployee() {
    console.log('Prompting user to add an employee...');
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
    console.log('User entered employee details:', { firstName, lastName, roleId, managerId });
    const employee = await queries.addEmployee(firstName, lastName, roleId, managerId);
    console.log('Employee added:', employee);
}

async function updateEmployeeRole() {
    console.log('Prompting user to update an employee role...');
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
            message: 'Select the new role for the employee:',
            choices: roles.map((r) => ({ name: r.title, value: r.id }))
        }
    ]);
    console.log('User entered employee and new role details:', { employeeId, newRoleId });
    const updatedEmployee = await queries.updateEmployeeRole(employeeId, newRoleId);
    console.log('Employee role updated:', updatedEmployee);
}

mainMenu();