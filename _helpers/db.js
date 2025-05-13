require('dotenv').config();
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    // Destructure environment variables
    const {
        DB_HOST,
        DB_PORT,
        DB_USER,
        DB_PASSWORD,
        DB_NAME
    } = process.env;

    // Connect to PostgreSQL
    const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
        host: DB_HOST,
        port: DB_PORT,
        dialect: 'postgres',
        logging: false // Optional: disables SQL logging in console
    });

    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }

    // Initialize models
    db.Account = require('../accounts/account.model')(sequelize);
    db.RefreshToken = require('../accounts/refresh.token.model')(sequelize);
    db.Department = require('../accounts/department.model')(sequelize, Sequelize.DataTypes);
    db.Employee = require('../accounts/employee.model')(sequelize, Sequelize.DataTypes);
    db.Workflow = require('../accounts/workflow.model')(sequelize, Sequelize.DataTypes);

    // Define relationships
    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);

    db.Department.hasMany(db.Employee, { as: 'Employees', foreignKey: 'departmentId', onDelete: 'CASCADE' });
    db.Employee.belongsTo(db.Department, { as: 'Department', foreignKey: 'departmentId' });

    db.Account.hasMany(db.Employee, { foreignKey: 'accountId', onDelete: 'CASCADE' });
    db.Employee.belongsTo(db.Account, { as: 'Account', foreignKey: 'accountId' });

    db.Employee.hasMany(db.Workflow, { foreignKey: 'employeeId', onDelete: 'CASCADE' });
    db.Workflow.belongsTo(db.Employee, { foreignKey: 'employeeId' });

    // Sync all models with PostgreSQL
    await sequelize.sync({ alter: true });
}
