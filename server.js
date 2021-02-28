// Dependencies
const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');
// including Chalk package for increased legibility
const chalk = require('chalk');
const connection = require('./config/connection');
const startMenu =['View all employees', 'View all employees by department', 'View all employees by manager',
'Add employee', 'Remove employee', 'Update employee role', 'View all roles', 'Add role', 'Remove role', 'View all departments', 'Add department', 'Remove department', 'Exit']


const startApp = () => {
    inquirer.prompt({
            name: 'menuChoice',
            type: 'list',
            message: 'Select an option',
            choices: startMenu
    }).then((answer) => {
        switch(answer.menuChoice) {
            case 'View all employees':
                break;
            case 'View employees by department':
                break;
            case 'View all employees by manager':
                break;
            case 'Add employee':
                break;
            case 'Remove employee':
                break;
            case 'Update employee role':
                break;
            case 'View all roles':
                break;
            case 'Add role':
                break;
            case 'Remove role':
                break;
            case 'View all departments':
                break;
            case 'Add department':
                break;
            case 'Remove department':
                break;
            case 'Exit':
                connection.end();
                break;
        }
    })
}