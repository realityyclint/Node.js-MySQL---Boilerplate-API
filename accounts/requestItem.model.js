const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const RequestItem = sequelize.define('RequestItem', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        requestId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Requests',
                key: 'id'
            }
        }
    }, {
        timestamps: true
    });

    RequestItem.associate = (models) => {
        RequestItem.belongsTo(models.Request, {
            foreignKey: 'requestId',
            as: 'Request',
            onDelete: 'CASCADE'
        });
    };

    return RequestItem;
};
