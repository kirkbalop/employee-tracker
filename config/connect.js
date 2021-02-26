const { connect } = require('http2');
const mysql = require('mysql');

connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'employee_db',
    multipleStatements: true
});

connection.connect((err) => {
    if (err){
        console.log(err);
        return;
    }

    console.log(`Connected to db ThreadID: ${connection.threadID}`);
})

module.exports = connection;