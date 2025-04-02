const express = require('express');
const router = express.Router();
const azureSupportService = require('../services/azureSupportService');
const db = require('../database/init').getDb();

// Get all subscriptions
router.get('/', async (req, res) => {
  try {
    // Try to get subscriptions from Azure API
    const subscriptions = await azureSupportService.getSubscriptions();
    res.json(subscriptions);
  } catch (error) {
    console.error('Error in /subscriptions route:', error);
    
    // Fallback to local database if API fails
    db.all('SELECT * FROM subscriptions', [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to retrieve subscriptions' });
      }
      res.json(rows);
    });
  }
});

module.exports = router;
