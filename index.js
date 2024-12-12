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

    getEmployeesByManager: async (managerId) => {
        const result = await pool.query(
            `SELECT * FROM employee WHERE manager_id = $1`, [managerId]
        );
        return result.rows;
    },

    getEmployeesByDepartment: async (departmentId) => {
        const result = await pool.query(
            `SELECT * FROM employee
            JOIN role ON employee.role_id = role.id
            WHERE role.department_id = $1`, [departmentId]
        );
        return result.rows;
    },

    getTotalDepartmentBudget: async (departmentId) => {
        const result = await pool.query(
            `SELECT SUM(role.salary) AS total_budget FROM employee
            JOIN role ON employee.role_id = role.id
            WHERE role.department_id = $1`, [departmentId]
        );
        return result.rows[0].total_budget;
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
    },

    updateEmployeeManager: async (employeeId, newManagerId) => {
        const result = await pool.query('UPDATE employee SET manager_id = $1 WHERE id = $2 RETURNING *', [newManagerId, employeeId]);
        return result.rows[0];
    },

    deleteDepartment: async (departmentId) => {
        const result = await pool.query('DELETE FROM department WHERE id = $1 RETURNING *', [departmentId]);
        return result.rows[0];
    },

    deleteRole: async (roleId) => {
        const result = await pool.query('DELETE FROM role WHERE id = $1 RETURNING *', [roleId]);
        return result.rows[0];
    },

    deleteEmployee: async (employeeId) => {
        const result = await pool.query('DELETE FROM employee WHERE id = $1 RETURNING *', [employeeId]);
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
            'View Employees by Manager',
            'View Employees by Department',
            'Add a Department',
            'Add a Role',
            'Add an Employee',
            'Update an Employee Role',
            'Update an Employee Manager',
            'Delete a Department',
            'Delete a Role',
            'Delete an Employee',
            'View Total Department Budget',
            'Exit'
        ]
    });

    switch (action) {
        case 'View All Departments': await viewAllDepartments(); break;
        case 'View All Roles': await viewAllRoles(); break;
        case 'View All Employees': await viewAllEmployees(); break;
        case 'View Employees by Manager': await viewEmployeesByManager(); break;
        case 'View Employees by Department': await viewEmployeesByDepartment(); break;
        case 'Add a Department': await addDepartment(); break;
        case 'Add a Role': await addRole(); break;
        case 'Add an Employee': await addEmployee(); break;
        case 'Update an Employee Role': await updateEmployeeRole(); break;
        case 'Update an Employee Manager': await updateEmployeeManager(); break;
        case 'Delete a Department': await deleteDepartment(); break;
        case 'Delete a Role': await deleteRole(); break;
        case 'Delete an Employee': await deleteEmployee(); break;
        case 'View Total Department Budget': await viewTotalDepartmentBudget(); break;
        case 'Exit': pool.end(); process.exit(0);
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

async function viewEmployeesByManager() {
    const employees = await queries.getEmployees();
    const { managerId } = await inquirer.prompt({
        type: 'list',
        name: 'managerId',
        message: 'Select a manager:',
        choices: [{ name: 'None', value: null }].concat(
            employees.map((e) => ({ name: `${e.first_name} ${e.last_name}`, value: e.id }))
        )
    });
    const employeesByManager = await queries.getEmployeesByManager(managerId);
    console.table(employeesByManager);
}

async function viewEmployeesByDepartment() {
    const departments = await queries.getDepartments();
    const { departmentId } = await inquirer.prompt({
        type: 'list',
        name: 'departmentId',
        message: 'Select a department:',
        choices: departments.map((d) => ({ name: d.name, value: d.id }))
    });
    const employeesByDepartment = await queries.getEmployeesByDepartment(departmentId);
    console.table(employeesByDepartment);
}

async function viewTotalDepartmentBudget() {
    const departments = await queries.getDepartments();
    const { departmentId } = await inquirer.prompt({
        type: 'list',
        name: 'departmentId',
        message: 'Select a department:',
        choices: departments.map((d) => ({ name: d.name, value: d.id }))
    });
    const totalBudget = await queries.getTotalDepartmentBudget(departmentId);
    console.log(`Total budget for the department: $${totalBudget}`);
}

// Functions for menu options
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

// Update Functions
async function updateDepartment() {
    const departments = await queries.getDepartments();
    const { departmentId, newName } = await inquirer.prompt([
        {
            type: 'list',
            name: 'departmentId',
            message: 'Select the department to update:',
            choices: departments.map((d) => ({ name: d.name, value: d.id }))
        },
        {
            type: 'input',
            name: 'newName',
            message: 'Enter the new name for the department:'
        }
    ]);
    const updatedDepartment = await queries.updateDepartment(departmentId, newName);
    console.log('Department updated:', updatedDepartment);
}

async function updateRole() {
    const roles = await queries.getRoles();
    const departments = await queries.getDepartments();
    const { roleId, newTitle, newSalary, newDepartmentId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'roleId',
            message: 'Select the role to update:',
            choices: roles.map((r) => ({ name: r.title, value: r.id }))
        },
        { type: 'input', name: 'newTitle', message: 'Enter the new title for the role:' },
        { type: 'input', name: 'newSalary', message: 'Enter the new salary for the role:' },
        {
            type: 'list',
            name: 'newDepartmentId',
            message: 'Select the new department for the role:',
            choices: departments.map((d) => ({ name: d.name, value: d.id }))
        }
    ]);
    const updatedRole = await queries.updateRole(roleId, newTitle, newSalary, newDepartmentId);
    console.log('Role updated:', updatedRole);
}

async function updateEmployee() {
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
    const updatedEmployee = await queries.updateEmployeeRole(employeeId, newRoleId);
    console.log('Employee updated:', updatedEmployee);
}

async function updateEmployeeManager() {
    const employees = await queries.getEmployees();
    const { employeeId, newManagerId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'employeeId',
            message: 'Select the employee to update manager:',
            choices: employees.map((e) => ({ name: `${e.first_name} ${e.last_name}`, value: e.id }))
        },
        {
            type: 'list',
            name: 'newManagerId',
            message: 'Select the new manager for the employee:',
            choices: [{ name: 'None', value: null }].concat(
                employees.map((e) => ({ name: `${e.first_name} ${e.last_name}`, value: e.id }))
            )
        }
    ]);
    const updatedEmployee = await queries.updateEmployeeManager(employeeId, newManagerId);
    console.log('Employee manager updated:', updatedEmployee);
}

// Delete Functions
async function deleteDepartment() {
    const departments = await queries.getDepartments();
    const { departmentId } = await inquirer.prompt({
        type: 'list',
        name: 'departmentId',
        message: 'Select a department to delete:',
        choices: departments.map((d) => ({ name: d.name, value: d.id }))
    });
    const deletedDepartment = await queries.deleteDepartment(departmentId);
    console.log('Department deleted:', deletedDepartment);
}

async function deleteRole() {
    const roles = await queries.getRoles();
    const { roleId } = await inquirer.prompt({
        type: 'list',
        name: 'roleId',
        message: 'Select a role to delete:',
        choices: roles.map((r) => ({ name: r.title, value: r.id }))
    });
    const deletedRole = await queries.deleteRole(roleId);
    console.log('Role deleted:', deletedRole);
}

async function deleteEmployee() {
    const employees = await queries.getEmployees();
    const { employeeId } = await inquirer.prompt({
        type: 'list',
        name: 'employeeId',
        message: 'Select an employee to delete:',
        choices: employees.map((e) => ({ name: `${e.first_name} ${e.last_name}`, value: e.id }))
    });
    const deletedEmployee = await queries.deleteEmployee(employeeId);
    console.log('Employee deleted:', deletedEmployee);
}

mainMenu();