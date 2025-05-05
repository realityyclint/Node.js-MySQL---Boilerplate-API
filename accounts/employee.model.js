const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const attributes = {
        firstName: { type: DataTypes.STRING, allowNull: false },
        lastName: { type: DataTypes.STRING, allowNull: false },
        departmentId: { type: DataTypes.INTEGER, allowNull: false }
    };

    const options = {
        timestamps: true // Enable createdAt and updatedAt fields
    };

    return sequelize.define('Employee', attributes, options);
};