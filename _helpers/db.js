const config = require('config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    // Create database if it doesn't exist
    const { host, port, user, password, database } = config.database;
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

    // Connect to database
    const sequelize = new Sequelize(database, user, password, { dialect: 'mysql' });

    // Initialize models and add them to the exported db object
    db.Account = require('../accounts/account.model')(sequelize);
    db.RefreshToken = require('../accounts/refresh.token.model')(sequelize);
    db.Department = require('../accounts/department.model')(sequelize, Sequelize.DataTypes);
    db.Employee = require('../accounts/employee.model')(sequelize, Sequelize.DataTypes);

    // Define relationships
    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);

    db.Department.hasMany(db.Employee, { as: 'Employees', foreignKey: 'departmentId', onDelete: 'CASCADE' });
    db.Employee.belongsTo(db.Department, { as: 'Department', foreignKey: 'departmentId' });

    // Sync all models with the database
    await sequelize.sync({ alter: true });
}