// request.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const attributes = {
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Pending' // Can be 'Pending', 'Approved', 'Rejected', etc.
        },
        employeeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Employees',
                key: 'id'
            }
        }
    };

    const options = {
        timestamps: true
    };

    const Request = sequelize.define('Request', attributes, options);

    // Define associations
    Request.associate = (models) => {
        Request.belongsTo(models.Employee, {
            foreignKey: 'employeeId',
            as: 'Employee'
        });

        Request.hasMany(models.RequestItem, {
            foreignKey: 'requestId',
            as: 'RequestItems',
            onDelete: 'CASCADE'
        });
    };

    return Request;
};
