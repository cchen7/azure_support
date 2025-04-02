const axios = require('axios');
const azureAuthService = require('./azureAuthService');
const db = require('../database/init').getDb();

class AzureSupportService {
  constructor() {
    this.apiVersion = '2020-04-01';
    this.baseUrl = 'https://management.azure.com';
  }

  async getHeaders(subscriptionId) {
    const token = await azureAuthService.getToken(subscriptionId);
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getSubscriptions() {
    try {
      const token = await azureAuthService.getToken();
      const response = await axios.get(
        `${this.baseUrl}/subscriptions?api-version=${this.apiVersion}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Store subscriptions in local database (non-sensitive data only)
      response.data.value.forEach(sub => {
        db.run(
          'INSERT OR REPLACE INTO subscriptions (id, displayName, state, last_updated) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
          [sub.subscriptionId, sub.displayName, sub.state]
        );
      });
      
      return response.data.value;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  }

  async getSupportCases(subscriptionId) {
    try {
      const headers = await this.getHeaders(subscriptionId);
      const response = await axios.get(
        `${this.baseUrl}/subscriptions/${subscriptionId}/providers/Microsoft.Support/supportTickets?api-version=${this.apiVersion}`,
        { headers }
      );
      
      // Store case data in local database (non-sensitive data only)
      response.data.value.forEach(caseData => {
        db.run(
          `INSERT OR REPLACE INTO support_cases 
           (id, subscription_id, title, severity, status, created_time, last_updated, service_name)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            caseData.name,
            subscriptionId,
            caseData.properties.title,
            caseData.properties.severity,
            caseData.properties.status,
            caseData.properties.createdDate,
            caseData.properties.modifiedDate,
            caseData.properties.serviceName
          ]
        );
      });
      
      return response.data.value;
    } catch (error) {
      console.error(`Error fetching support cases for subscription ${subscriptionId}:`, error);
      throw error;
    }
  }

  async getCaseDetails(subscriptionId, caseId) {
    try {
      const headers = await this.getHeaders(subscriptionId);
      const response = await axios.get(
        `${this.baseUrl}/subscriptions/${subscriptionId}/providers/Microsoft.Support/supportTickets/${caseId}?api-version=${this.apiVersion}`,
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching case details for case ${caseId}:`, error);
      throw error;
    }
  }

  async getCaseCommunications(subscriptionId, caseId) {
    try {
      const headers = await this.getHeaders(subscriptionId);
      const response = await axios.get(
        `${this.baseUrl}/subscriptions/${subscriptionId}/providers/Microsoft.Support/supportTickets/${caseId}/communications?api-version=${this.apiVersion}`,
        { headers }
      );
      
      // Store minimal communication metadata in local db (not content)
      response.data.value.forEach(comm => {
        db.run(
          `INSERT OR REPLACE INTO case_communications 
           (id, case_id, sender, created_time, type)
           VALUES (?, ?, ?, ?, ?)`,
          [
            comm.name,
            caseId,
            comm.properties.sender,
            comm.properties.createdDate,
            comm.properties.communicationType
          ]
        );
      });
      
      return response.data.value;
    } catch (error) {
      console.error(`Error fetching communications for case ${caseId}:`, error);
      throw error;
    }
  }

  async addCommunication(subscriptionId, caseId, communicationContent) {
    try {
      const headers = await this.getHeaders(subscriptionId);
      const response = await axios.post(
        `${this.baseUrl}/subscriptions/${subscriptionId}/providers/Microsoft.Support/supportTickets/${caseId}/communications?api-version=${this.apiVersion}`,
        {
          properties: {
            communicationType: 'Web',
            subject: communicationContent.subject,
            body: communicationContent.body
          }
        },
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error adding communication to case ${caseId}:`, error);
      throw error;
    }
  }
}

module.exports = new AzureSupportService();
