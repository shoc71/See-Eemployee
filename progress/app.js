const {
    getDepartments,
    getRoles,
    getEmployees,
    addDepartment,
    addRole,
    addEmployee,
} = require('../db/queries');

(async () => {
    try {
        // Fetch and log all departments
        const departments = await getDepartments();
        console.log('Departments:', departments);

        // Fetch and log all roles
        const roles = await getRoles();
        console.log('Roles:', roles);

        // Fetch and log all employees
        const employees = await getEmployees();
        console.log('Employees:', employees);

        // Add a new department (example)
        await addDepartment('Engineering');
        console.log('Added new department: Engineering');

        // Add a new role (example)
        await addRole('Software Engineer', 120000, 1); // Assuming department_id 1 exists
        console.log('Added new role: Software Engineer');

        // Add a new employee (example)
        await addEmployee('John', 'Doe', 1, null); // Assuming role_id 1 exists and no manager
        console.log('Added new employee: John Doe');
    } catch (err) {
        console.error('Error:', err.message);
    }
})();
