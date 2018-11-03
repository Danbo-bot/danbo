module.exports = (sequelize, DataTypes) => sequelize.define('servers', {
  server_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  server_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  levels_string: {
    type: DataTypes.STRING,
    defaultValue: 'See %server_name%\'s leaderboard here: %url%'
  },
  remove_roles: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
}, {
  timestamps: false,
});
