INSERT INTO departments(department_name)
VALUES
('Management'),
('Office Management'),
('Human Resources'),
('Sales'),
('Accounting'),
('Warehouse');

INSERT INTO roles(title, salary, department_id)
VALUES
('Regional Manager', 150000, 1),
('Receptionist', 45000, 2),
('HR Representative', 71000, 3),
('Sales Representative', 70000, 4),
('Accountant', 90000, 5),
('Warehouse Worker', 40000, 6);

INSERT INTO employees(first_name, last_name, role_id)
VALUES
('Michael', 'Scott', 1),
('Pamela', 'Beesly', 2),
('Toby', 'Flenderson', 3),
('James', 'Halpert', 4),
('Stanley', 'Hudson', 5),
('Darryl', 'Philbin', 6);

UPDATE `employee_db`.`employees` SET `manager_id` = '1' WHERE (`id` > '1');
