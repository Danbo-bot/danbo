module.exports = (sequelize, DataTypes) => sequelize.define('reward', {
  role_id: DataTypes.STRING,
  role_name: DataTypes.STRING,
  server_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  level_gained: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
}, {
  timestamps: false,
});
