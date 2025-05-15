require('dotenv').config();
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    const {
        DB_HOST,
        DB_PORT,
        DB_USER,
        DB_PASSWORD,
        DB_NAME
    } = process.env;

    const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
        host: DB_HOST,
        port: DB_PORT,
        dialect: 'postgres',
        logging: false
    });

    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }

    // Models
    db.Account = require('../accounts/account.model')(sequelize);
    db.RefreshToken = require('../accounts/refresh.token.model')(sequelize);
    db.Department = require('../accounts/department.model')(sequelize, Sequelize.DataTypes);
    db.Employee = require('../accounts/employee.model')(sequelize, Sequelize.DataTypes);
    db.Workflow = require('../accounts/workflow.model')(sequelize, Sequelize.DataTypes);
    db.Request = require('../accounts/request.model')(sequelize, Sequelize.DataTypes);
    db.RequestItem = require('../accounts/requestItem.model')(sequelize, Sequelize.DataTypes);

    // Relationships
    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);

    db.Department.hasMany(db.Employee, { as: 'Employees', foreignKey: 'departmentId', onDelete: 'CASCADE' });
    db.Employee.belongsTo(db.Department, { as: 'Department', foreignKey: 'departmentId' });

    db.Account.hasMany(db.Employee, { foreignKey: 'accountId', onDelete: 'CASCADE' });
    db.Employee.belongsTo(db.Account, { as: 'Account', foreignKey: 'accountId' });

    db.Employee.hasMany(db.Workflow, { foreignKey: 'employeeId', onDelete: 'CASCADE' });
    db.Workflow.belongsTo(db.Employee, { foreignKey: 'employeeId' });

    db.Employee.hasMany(db.Request, { foreignKey: 'employeeId', onDelete: 'CASCADE' });
    db.Request.belongsTo(db.Employee, { as: 'Employee', foreignKey: 'employeeId' });

    db.Request.hasMany(db.RequestItem, { foreignKey: 'requestId', as: 'RequestItems', onDelete: 'CASCADE' });
    db.RequestItem.belongsTo(db.Request, { foreignKey: 'requestId', as: 'Request' });

    // Sync all models
    await db.Account.sync({ alter: true });
    await db.Department.sync({ alter: true });
    await db.Employee.sync({ alter: true });
    await db.Workflow.sync({ alter: true });
    await db.RefreshToken.sync({ alter: true });
    await db.Request.sync({ alter: true });
    await db.RequestItem.sync({ alter: true });

    await sequelize.sync({ alter: true });
}
