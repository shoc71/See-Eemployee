const inquirer = require('inquirer');

async function mainMenu() {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'What would you like to do?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Exit',
            ],
        },
    ]);
}

async function departmentPrompt() {
    return inquirer.prompt([
        { type: 'input', name: 'name', message: 'Enter department name:' },
    ]);
}

async function rolePrompt(departments) {
    return inquirer.prompt([
        { type: 'input', name: 'title', message: 'Enter role title:' },
        { type: 'input', name: 'salary', message: 'Enter role salary:' },
        {
            type: 'list',
            name: 'department_id',
            message: 'Select a department:',
            choices: departments.map((d) => ({ name: d.name, value: d.id })),
        },
    ]);
}

async function employeePrompt(roles, employees) {
    return inquirer.prompt([
        { type: 'input', name: 'firstName', message: 'Enter first name:' },
        { type: 'input', name: 'lastName', message: 'Enter last name:' },
        {
            type: 'list',
            name: 'role_id',
            message: 'Select a role:',
            choices: roles.map((r) => ({ name: r.title, value: r.id })),
        },
        {
            type: 'list',
            name: 'manager_id',
            message: 'Select a manager (or none):',
            choices: [
                { name: 'None', value: null },
                ...employees.map((e) => ({
                    name: `${e.first_name} ${e.last_name}`,
                    value: e.id,
                })),
            ],
        },
    ]);
}

module.exports = {
    mainMenu,
    departmentPrompt,
    rolePrompt,
    employeePrompt,
};
