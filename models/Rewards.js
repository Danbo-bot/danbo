module.exports = (sequelize, DataTypes) => {
	return sequelize.define('level_reward', {
		role_id: DataTypes.STRING,
		server_id: {
            type:DataTypes.STRING,
            primaryKey: true,
        },
        level_gained:{
            type: DataTypes.INTEGER,
            primaryKey: true,
        }
	}, {
		timestamps: false,
	});
};