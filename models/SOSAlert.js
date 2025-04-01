const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SOSAlert = sequelize.define('SOSAlert', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  location: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const rawValue = this.getDataValue('location');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('location', JSON.stringify(value));
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'resolved', 'cancelled'),
    defaultValue: 'active'
  },
  videoStreamUrl: {
    type: DataTypes.STRING
  },
  resolvedAt: {
    type: DataTypes.DATE
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

SOSAlert.associate = function(models) {
  SOSAlert.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

module.exports = SOSAlert;