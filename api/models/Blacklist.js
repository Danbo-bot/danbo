module.exports = (sequelize, DataTypes) => sequelize.define('blacklist', {
  role_id: DataTypes.STRING,
  role_name: DataTypes.STRING,
  server_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
}, {
  timestamps: false,
});

