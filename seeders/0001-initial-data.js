'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create admin user
    await queryInterface.bulkInsert('Users', [{
      email: 'admin@emergency.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
      language: 'en',
      medicalInfo: JSON.stringify({
        bloodType: 'O+',
        allergies: ['Penicillin'],
        conditions: ['None'],
        medications: ['None']
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

    // Get the admin user ID
    const [users] = await queryInterface.sequelize.query(
      'SELECT id FROM Users WHERE email = "admin@emergency.com"'
    );
    const adminId = users[0].id;

    // Create test user
    await queryInterface.bulkInsert('Users', [{
      email: 'user@test.com',
      password: await bcrypt.hash('test123', 10),
      role: 'user',
      language: 'en',
      medicalInfo: JSON.stringify({
        bloodType: 'A-',
        allergies: ['Peanuts'],
        conditions: ['Asthma'],
        medications: ['Inhaler']
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

    // Get the test user ID
    const [testUsers] = await queryInterface.sequelize.query(
      'SELECT id FROM Users WHERE email = "user@test.com"'
    );
    const testUserId = testUsers[0].id;

    // Create emergency contacts for test user
    await queryInterface.bulkInsert('EmergencyContacts', [{
      userId: testUserId,
      name: 'John Doe',
      phone: '+1234567890',
      email: 'john@example.com',
      relationship: 'family',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      userId: testUserId,
      name: 'Jane Smith',
      phone: '+1987654321',
      email: 'jane@example.com',
      relationship: 'friend',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

    // Create sample geo fences
    await queryInterface.bulkInsert('GeoFences', [{
      userId: testUserId,
      name: 'Home',
      coordinates: JSON.stringify({
        latitude: 34.052235,
        longitude: -118.243683
      }),
      radius: 200, // meters
      alertOnExit: true,
      alertOnEnter: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

    // Create sample community alerts
    await queryInterface.bulkInsert('CommunityAlerts', [{
      title: 'Earthquake Warning',
      description: 'Magnitude 5.8 earthquake detected in the area. Take precautions.',
      alertType: 'natural_disaster',
      severity: 'high',
      location: JSON.stringify({
        latitude: 34.052235,
        longitude: -118.243683
      }),
      radius: 50, // km
      startTime: new Date(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      createdBy: adminId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('CommunityAlerts', null, {});
    await queryInterface.bulkDelete('GeoFences', null, {});
    await queryInterface.bulkDelete('EmergencyContacts', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};