/**
 * Zenith India - Backend API Service Layer
 * 
 * Ready for future integration with the AI analysis backend.
 * All requests route to our secure backend server; no direct LLM keys are used here.
 */

import { env } from '../config/env.js';

class ApiService {
  constructor() {
    this.baseUrl = env.apiBaseUrl;
  }

  /**
   * Helper to make HTTP requests with standard error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Clean diagnostic error without leaking internal details
      return {
        success: false,
        isNetworkError: true,
        message: error.message || 'Unable to connect to the Zenith AI backend service.',
      };
    }
  }

  /**
   * Check if the backend AI validation service is reachable
   */
  async checkHealth() {
    return this.request('/health', { method: 'GET' });
  }

  /**
   * Submit startup idea for AI validation
   * (Will be connected once the backend analysis service is launched)
   * 
   * @param {Object} ideaPayload
   * @param {string} ideaPayload.title - Name or one-liner of the startup
   * @param {string} ideaPayload.description - Detailed problem & solution
   * @param {string} ideaPayload.targetMarket - Target customer segment in India/Global
   * @param {string} ideaPayload.monetization - Proposed revenue model
   */
  async validateStartupIdea(ideaPayload) {
    return this.request('/validate', {
      method: 'POST',
      body: JSON.stringify(ideaPayload),
    });
  }

  /**
   * Send question to AI Customer Persona Simulator
   * (Falls back transparently to archetype simulator when backend is offline)
   */
  async chatWithPersona(payload) {
    return this.request('/persona/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const api = new ApiService();
export default api;
