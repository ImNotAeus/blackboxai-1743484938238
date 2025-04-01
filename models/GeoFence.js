const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const GeoFence = sequelize.define('GeoFence', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  coordinates: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const rawValue = this.getDataValue('coordinates');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('coordinates', JSON.stringify(value));
    }
  },
  radius: {
    type: DataTypes.FLOAT, // in meters
    allowNull: false,
    validate: {
      min: 50 // Minimum 50 meter radius
    }
  },
  alertOnExit: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  alertOnEnter: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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

GeoFence.associate = function(models) {
  GeoFence.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

module.exports = GeoFence;