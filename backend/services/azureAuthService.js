const { ClientSecretCredential } = require('@azure/identity');
const axios = require('axios');

// In-memory token cache - avoid storing tokens in the database
const tokenCache = new Map();

class AzureAuthService {
  constructor() {
    this.tenantId = process.env.AZURE_TENANT_ID;
    this.clientId = process.env.AZURE_CLIENT_ID;
    this.clientSecret = process.env.AZURE_CLIENT_SECRET;
    this.credential = new ClientSecretCredential(
      this.tenantId,
      this.clientId,
      this.clientSecret
    );
  }

  async getToken(subscriptionId) {
    try {
      // Check if we have a valid token in cache
      const cachedToken = tokenCache.get(subscriptionId);
      if (cachedToken && cachedToken.expiresOn > Date.now()) {
        return cachedToken.token;
      }

      // Get new token
      const token = await this.credential.getToken('https://management.azure.com/.default');
      
      // Cache token with expiration time (subtract 5 minutes for safety)
      const expiresOn = Date.now() + (token.expiresOn - 300) * 1000;
      tokenCache.set(subscriptionId, {
        token: token.token,
        expiresOn
      });
      
      return token.token;
    } catch (error) {
      console.error('Error getting Azure token:', error);
      throw new Error('Authentication failed');
    }
  }

  clearTokenCache() {
    tokenCache.clear();
  }
}

module.exports = new AzureAuthService();
