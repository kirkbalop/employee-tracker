// Dependencies
const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');
// including Chalk package for increased legibility
const chalk = require('chalk');
const connection = require('./config/connection');
const { start } = require('repl');


// Arrays for inquirer menu selections
const startMenu =['View all employees', 'View all employees by department', 'View all employees by manager',
'Add employee', 'Remove employee', 'Update employee role', 'View all roles', 'Add role', 'Remove role', 'View all departments', 'Add department', 'Remove department', 'Exit']
const allEmployeeQuery = `SELECT e.id, e.first_name AS "First Name", e.last_name AS "Last Name", r.title, d.department_name AS "Department", IFNULL(r.salary, 'No Data') AS "Salary", CONCAT(m.first_name," ",m.last_name) AS "Manager"
FROM employees e
LEFT JOIN roles r 
ON r.id = e.role_id 
LEFT JOIN departments d 
ON d.id = r.department_id
LEFT JOIN employees m ON m.id = e.manager_id
ORDER BY e.id;`
const addEmployeeQuestions = ['What is the first name?', 'What is the last name?', 'What is their role?', 'Who is their manager?']
const roleQuery = `SELECT * FROM roles; SELECT CONCAT (e.first_name," ",e.last_name) AS full_name FROM employees e`
const mgrQuery = `SELECT CONCAT (e.first_name," ", e.last_name) AS full_name, r.title, d.department_name AS "Department", IFNULL(r.salary, 'No data') AS "Salary", CONCAT(m.first_name," ",m.last_name) AS "Manager"
FROM employees e
LEFT JOIN roles r
ON r.id = e.role_id
LEFT JOIN departments d
ON d.id = r.department_id
LEFT JOIN employees m ON m.id = e.manager_id
ORDER BY e.id;`
const startApp = () => {
    inquirer.prompt({
            name: 'menuChoice',
            type: 'list',
            message: 'Select an option',
            choices: startMenu
    }).then((answer) => {
        switch(answer.menuChoice) {
            case 'View all employees':
                showAllEmployees();
                break;
            case 'View employees by department':
                empByDept();
                break;
            case 'View all employees by manager':
                empByMgr();
                break;
            case 'Add employee':
                addEmp();
                break;
            case 'Remove employee':
                removeEmp();
                break;
            case 'Update employee role':
                updateEmpRole();
                break;
            case 'View all roles':
                viewRoles();
                break;
            case 'Add role':
                addRole();
                break;
            case 'Remove role':
                removeRole();
                break;
            case 'View all departments':
                viewDept();
                break;
            case 'Add department':
                addDept();
                break;
            case 'Remove department':
                removeDept();
                break;
            case 'Exit':
                connection.end();
                break;
        }
    })
}

const showAllEmployees = () => {
    connection.query(allEmployeeQuery, (err, results) => {
        if (err) throw err;
        console.log(' ');
        console.table(chalk.yellow('All Employees'), results)
        startApp();
    })
}

const empByDept = () => {
    const deptQuery = 'SELECT * FROM departments';
    connection.query(deptQuery, (err, results) => {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'deptSelection',
                type: 'list',
                choices: function() {
                    let choiceArray = results.map(choice => choice.departmet_name)
                    return choiceArray;
                },
                message: 'Select a department:'
            }
        ]).then((answer) => {
            let selectedDept;
            for (let i = 0; i < results.length; i++) {
                if (results[i].department_name === answer.deptSelection) {
                    selectedDept = results[i];
                }
            }
            
        const query = 'SELECT e.id, e.first_name AS "First Name", e.last_name AS "Last Name", r.title AS "Title", d.department_name AS "Department", r.salary AS "Salary" FROM employees e INNER JOIN roles r ON r.id = e.role_id INNER JOIN departments d ON d.id = r.department_id WHERE ?;';
        connection.query(query, { department_name: selectedDept.department_name }, (err, res) => {
            console.log(' ');
            console.table(chalk.yellow(`All employees by department: ${selectedDept.department_name}`), res)
            startApp();
        })
        })
    })
}

const empByMgr = () => {
    connection.query(mgrQuery, (err, results) => {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'mgr_selection',
                type: 'list',
                choices: function() {
                    let choiceArray = results.map(choice => choice.full_name);
                    return choiceArray;
                },
                message: 'Select a manager:'
            }
        ]).then((answer) => {
            const mgrQuery2 = `SELECT e.id, e.first_name AS "First Name", e.last_name AS "Last Name", IFNULL(r.title, "No Data") AS "Title", IFNULL(d.department_name, "No Data") AS "Department", IFNULL(r.salary, 'No Data') AS "Salary", CONCAT(m.first_name," ",m.last_name) AS "Manager"
            FROM employees e
            LEFT JOIN roles r 
            ON r.id = e.role_id 
            LEFT JOIN departments d 
            ON d.id = r.department_id
            LEFT JOIN employees m ON m.id = e.manager_id
            WHERE CONCAT(m.first_name," ",m.last_name) = ?
            ORDER BY e.id;`
        connection.query(mgrQuery2, [answer.mgr_selection], (err, results) => {
            if (err) throw err;
            console.log(' ');
            console.table(chalk.yellow('Employees by manager'), results);
            startApp();
        })
        })
    })
}

const addEmp = () => {
    connection.query(roleQuery, (err, results) => {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'fName',
                type: 'input',
                message: addEmployeeQuestions[0]
            },
            {
                name: 'lName',
                type: 'input',
                message: addEmployeeQuestions[1]
            },
            {
                name: 'role',
                type: 'list',
                choices: function() {
                    let choiceArray = results[0].map(choice => choice.title);
                    return choiceArray;
                }
            },
            {
                name: 'manager',
                type: 'list',
                choices: function() {
                    let choiceArray = results[1].map(choice => choice.full_name);
                    return choiceArray;
                },
                message: addEmployeeQuestions[3]
            }
        ]).then((answer) => {
            connection.query(
                `INSERT INTO employees(first_name, last_name, role_id, manager_id) VALUES(?, ?, 
                    (SELECT id FROM roles WHERE title = ? ), 
                    (SELECT id FROM (SELECT id FROM employees WHERE CONCAT(first_name," ",last_name) = ? ) AS tmptable))`, [answer.fName, answer.lName, answer.role, answer.manager]
            )
            startApp();
        })
        })
}

const removeEmp = () => {
    connection.query(allEmployeeQuery, (err, results) => {
        if (err) throw err;
        console.log(' ');
        console.table(chalk.yellow('All employees'), results)
        inquirer.prompt([
            {
                name: 'removeID',
                type: 'input',
                message: 'Enter the ID of the employee you would like to remove:'
            }
        ]).then((answer) => {
            connection.query(`DELETE FROM employees where ?`, { id: answer.removeID })
            startApp();
        })
    })
}

const updateEmpRole = () => {
    const query = `SELECT CONCAT (first_name, " ", last_name) AS full_name FROM employees; SELECT title FROM roles`
    connection.query(query, (err, results) => {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'roleEmp',
                type: 'list',
                choices: function() {
                    let choiceArray = results[0].map(choice => choice.full_name);
                    return choiceArray;
                },
                message: "Select the employee who's role you would like to update:"
            },
            {
                name: 'updatedRole',
                type: 'list',
                choices: function() {
                    let choiceArray = results[1].map(choice => choice.title);
                    return choiceArray;
                }
            }
        ]).then((answer) => {
            connection.query(`UPDATE employees
            SET role_id = (SELECT id FROM roles WHERE title = ? )
            WHERE id = (SELECT id FROM(SELECT id FROM employees WHERE CONCAT(first_name," ",last_name) = ?) AS tmptable)`, [answer.updatedRole, answer.roleEmp], (err, results) => {
                if (err) throw err;
                startApp();
            })
        })
    })
}

const viewRoles = () => {
    let query = `Select title AS "Title" FROM roles`;
    connection.query(query, (err, results) => {
        if (err) throw err;

        console.log(' ');
        console.table(chalk.yellow('All roles'), results);
        startApp();
    })
}

const addRole = () => {
    const addRoleQuery = `SELECT * FROM roles; SELECT * FROM departments`
    connection.query(addRoleQuery, (err, results) => {
        if (err) throw err;

        console.log(' ');
        console.table(chalk.yellow('List of current roles:'), results[0]);

        inquirer.prompt([
            {
                name: 'newRole',
                type: 'input',
                message: 'Enter the new title:'
            },
            {
                name: 'newSalary',
                type: 'input',
                message: 'Enter the salary for the new role:'
            },
            {
                name: 'dept',
                type: 'list',
                choices: function() {
                    let choiceArray = results[1].map(choice => choice.department_name);
                    return choiceArray;
                },
                message: 'Select the department associated with the new title:'
            }
        ]).then((answer) => {
            connection.query(
                `INSERT INTO roles(title, salary, department_id)
                VALUES
                
                ("${answer.newRole}", "${answer.newSalary}",
                (SELECT id FROM departments WHERE department_name = "${answer.dept}"));`
            )
            startApp();
        })
    })
}

removeRole = () => {
    query = `SELECT * FROM roles`;
    connection.query(query, (err, results) => {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'removeRole',
                type: 'list',
                choices: function() {
                    let choiceArray = results.map(choice => choices.title);
                    return choiceArray;
                },
                message: 'Select a role to remove:'
            }
        ]).then((answer) => {
            connection.query(`DELETE FROM roles WHERE ? `, { title: answer.removeRole });
        })
    })
}

const viewDept = () => {
    query = `SELECT department_name AS "Departments" FROM departmnets`;
    connection.query(query, (err, results) => {
        if (err) throw err;

        console.log(' ');
        console.table(chalk.yellow('All departments'), results)
        startApp();
    })
}

const addDept = () => {
    query = `SELECT department_name AS "Departments" FROM departments`;
    connection.query(query, (err, results) => {
        if (err) throw err;

        console.log(' ');
        console.table(chalk.yellow('List of current departments'), results);

        inquirer.prompt([
            {
                name: 'newDept',
                type: 'input',
                message: 'Enter the name of the department to be added:'
            }
        ]).then((answer) => {
            connection.query(`INSERT INTO departments(department_name) VALUES ( ? )`, answer.newDept)
            startApp();
        })
    })
}

const removeDept = () => {
    query = `SELECT * FROM departments`;
    connection.query(query, (err, results) => {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'dept',
                type: 'list',
                choices: function() {
                    let choiceArray = results.map(choice => choice.department_name);
                    return choiceArray;
                },
                message: 'Select the department to remove:'
            }
        ]).then((answer) => {
            connection.query(`DELETE FROM departments WHERE ? `, { department_name: answer.dept })
            startApp();
        })
    })
}

startApp();