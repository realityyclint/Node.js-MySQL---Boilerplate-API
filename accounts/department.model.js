const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const attributes = {
        name: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: true }
    };

    const options = {
        timestamps: true // Enable createdAt and updatedAt fields
    };

    return sequelize.define('Department', attributes, options);
};