-- seeds.sql: Adding sample data to the department, role, and employee tables
INSERT INTO department (name) VALUES
    ('Engineering'),
    ('Human Resources'),
    ('Sales');

INSERT INTO role (title, salary, department_id) VALUES
    ('Software Engineer', 120000, 1),
    ('HR Manager', 80000, 2),
    ('Sales Associate', 60000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
    ('John', 'Doe', 1, NULL),
    ('Jane', 'Smith', 2, 1),
    ('Jake', 'Brown', 3, 2);
