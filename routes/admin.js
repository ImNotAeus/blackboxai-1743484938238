const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middlewares/authMiddleware');
const { User } = require('../models/User');
const { SOSAlert } = require('../models/SOSAlert');
const { EmergencyContact } = require('../models/EmergencyContact');

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get all active alerts
router.get('/alerts', adminAuth, async (req, res) => {
  try {
    const alerts = await SOSAlert.findAll({
      where: { status: 'active' },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    const formattedAlerts = alerts.map(alert => ({
      id: alert.id,
      userId: alert.userId,
      userEmail: alert.user.email,
      location: alert.location,
      videoStreamUrl: alert.videoStreamUrl,
      createdAt: alert.createdAt
    }));

    res.json(formattedAlerts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch alerts' });
  }
});

// Resolve an alert
router.put('/alerts/:id/resolve', adminAuth, async (req, res) => {
  try {
    const alert = await SOSAlert.findByPk(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    await alert.update({ 
      status: 'resolved',
      resolvedAt: new Date()
    });

    res.json({ message: 'Alert resolved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to resolve alert' });
  }
});

// Get user details
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'email', 'role', 'language', 'createdAt'],
      include: [{
        model: EmergencyContact,
        as: 'emergencyContacts',
        attributes: ['id', 'name', 'phone', 'email', 'relationship']
      }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch user details' });
  }
});

module.exports = router;