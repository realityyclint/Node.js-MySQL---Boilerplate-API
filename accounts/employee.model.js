const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const attributes = {
        position: { type: DataTypes.STRING, allowNull: false },
        accountId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Accounts',
                key: 'id'
            }
        },
        departmentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Departments',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Active'
        },
        hireDate: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.getDataValue('createdAt');
            }
        }
    };

    const options = {
        timestamps: true
    };

    const Employee = sequelize.define('Employee', attributes, options);

    // Define associations
    Employee.associate = (models) => {
        Employee.belongsTo(models.Department, { foreignKey: 'departmentId', as: 'Department' });
        Employee.belongsTo(models.Account, { foreignKey: 'accountId', as: 'Account' });
    };

    return Employee;
};
