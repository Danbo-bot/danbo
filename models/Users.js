module.exports = (sequelize, DataTypes) => sequelize.define('users', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  disc: {
    type: DataTypes.STRING,
  },
  avatar_url: {
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
