module.exports = (sequelize, DataTypes) => {
    return sequelize.define('servers', {
        server_id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        remove_roles: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        }
    }, {
        timestamps: false,
    });
};