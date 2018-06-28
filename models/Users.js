module.exports = (sequelize, DataTypes) => sequelize.define('users', {
  user_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  user_name: {
    type: DataTypes.STRING,
  },
  user_avatar: {
    type: DataTypes.STRING,
  },
  experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
}, {
  timestamps: false,
});
