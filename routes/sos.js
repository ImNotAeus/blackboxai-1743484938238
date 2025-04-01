const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/authMiddleware');
const { User } = require('../models/User');
const { EmergencyContact } = require('../models/EmergencyContact');
const { SOSAlert } = require('../models/SOSAlert');
const twilio = require('twilio');
const { io } = require('../server');

// Mock Twilio client for development
const twilioClient = process.env.NODE_ENV === 'production' 
  ? new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
  : {
      messages: {
        create: async () => {
          console.log('Mock Twilio - SMS would be sent here');
          return { sid: 'mock_sms_id' };
        }
      }
    };

// Trigger SOS alert
router.post('/', auth, async (req, res) => {
  try {
    const { latitude, longitude, videoStreamUrl } = req.body;
    const userId = req.user.id;

    // Create SOS alert record
    const alert = await SOSAlert.create({
      userId,
      location: JSON.stringify({ latitude, longitude }),
      status: 'active'
    });

    // Get user's emergency contacts
    const contacts = await EmergencyContact.findAll({ where: { userId } });

    // Send notifications to contacts
    const messages = await Promise.all(
      contacts.map(contact => {
        return twilioClient.messages.create({
          body: `EMERGENCY ALERT: ${req.user.email} needs help! Location: https://maps.google.com/?q=${latitude},${longitude}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: contact.phone
        });
      })
    );

    // Broadcast real-time update
    io.emit('sosAlert', {
      alertId: alert.id,
      userId,
      location: { latitude, longitude },
      timestamp: alert.createdAt
    });

    res.status(201).json({ 
      message: 'SOS alert activated', 
      alertId: alert.id,
      contactsNotified: messages.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to activate SOS alert' });
  }
});

// Get user's active alerts
router.get('/', auth, async (req, res) => {
  try {
    const alerts = await SOSAlert.findAll({ 
      where: { 
        userId: req.user.id,
        status: 'active'
      },
      order: [['createdAt', 'DESC']]
    });

    res.json(alerts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch alerts' });
  }
});

// Cancel alert
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const alert = await SOSAlert.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    await alert.update({ status: 'cancelled' });
    io.emit('sosCancelled', { alertId: alert.id });

    res.json({ message: 'Alert cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to cancel alert' });
  }
});

module.exports = router;