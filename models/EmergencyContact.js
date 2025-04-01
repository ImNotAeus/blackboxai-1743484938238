const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const EmergencyContact = sequelize.define('EmergencyContact', {
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
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^\+?[1-9]\d{1,14}$/ // E.164 phone number format
    }
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  },
  relationship: {
    type: DataTypes.STRING,
    defaultValue: 'family'
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

EmergencyContact.associate = function(models) {
  EmergencyContact.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

module.exports = EmergencyContact;