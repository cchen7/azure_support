const express = require('express');
const router = express.Router();
const azureSupportService = require('../services/azureSupportService');
const db = require('../database/init').getDb();

// Get all cases for multiple subscriptions
router.get('/', async (req, res) => {
  try {
    const { subscriptions } = req.query;
    
    if (!subscriptions) {
      return res.status(400).json({ error: 'Subscriptions parameter required' });
    }
    
    // Parse subscription IDs
    const subscriptionIds = subscriptions.split(',');
    
    // Get cases for each subscription
    const allCasesPromises = subscriptionIds.map(id => 
      azureSupportService.getSupportCases(id)
    );
    
    // Wait for all promises to resolve
    const results = await Promise.allSettled(allCasesPromises);
    
    // Combine results
    const allCases = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value);
      
    res.json(allCases);
  } catch (error) {
    console.error('Error in /cases route:', error);
    
    // Fallback to local database
    const { subscriptions } = req.query;
    if (!subscriptions) {
      return res.status(400).json({ error: 'Subscriptions parameter required' });
    }
    
    const subscriptionIds = subscriptions.split(',').map(id => `'${id}'`).join(',');
    
    db.all(`SELECT * FROM support_cases WHERE subscription_id IN (${subscriptionIds})`, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to retrieve support cases' });
      }
      res.json(rows);
    });
  }
});

// Get case details by ID
router.get('/:subscriptionId/:caseId', async (req, res) => {
  try {
    const { subscriptionId, caseId } = req.params;
    const caseDetails = await azureSupportService.getCaseDetails(subscriptionId, caseId);
    res.json(caseDetails);
  } catch (error) {
    console.error(`Error getting case details for ${req.params.caseId}:`, error);
    res.status(500).json({ error: 'Failed to retrieve case details' });
  }
});

// Get case communications
router.get('/:subscriptionId/:caseId/communications', async (req, res) => {
  try {
    const { subscriptionId, caseId } = req.params;
    const communications = await azureSupportService.getCaseCommunications(subscriptionId, caseId);
    
    // Notify connected clients about new communications
    req.app.get('io').to(`subscription-${subscriptionId}`).emit('communication-update', {
      caseId,
      update: 'new-communication'
    });
    
    res.json(communications);
  } catch (error) {
    console.error(`Error getting communications for case ${req.params.caseId}:`, error);
    res.status(500).json({ error: 'Failed to retrieve case communications' });
  }
});

// Add communication to a case
router.post('/:subscriptionId/:caseId/communications', async (req, res) => {
  try {
    const { subscriptionId, caseId } = req.params;
    const { subject, body } = req.body;
    
    if (!subject || !body) {
      return res.status(400).json({ error: 'Subject and body are required' });
    }
    
    const result = await azureSupportService.addCommunication(
      subscriptionId, 
      caseId, 
      { subject, body }
    );
    
    // Notify connected clients about the new communication
    req.app.get('io').to(`subscription-${subscriptionId}`).emit('communication-update', {
      caseId,
      update: 'new-communication'
    });
    
    res.json(result);
  } catch (error) {
    console.error(`Error adding communication to case ${req.params.caseId}:`, error);
    res.status(500).json({ error: 'Failed to add communication' });
  }
});

module.exports = router;
