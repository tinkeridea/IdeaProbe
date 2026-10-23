/**
 * Zenith India - Safe Environment Configuration
 * Centralizes access to environment variables in Vite.
 *
 * IMPORTANT SECURITY RULES:
 * 1. Only variables prefixed with VITE_ are exposed to the client.
 * 2. NEVER put private AI API keys (OpenAI, Anthropic, Gemini, etc.) here or in .env.
 * 3. Frontend connects strictly to our secure backend API URL.
 */

export const env = {
  // Base URL for the future AI analysis backend API
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  
  // Current app environment ('development' | 'production' | 'test')
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  appEnv: import.meta.env.VITE_APP_ENV || (import.meta.env.DEV ? 'development' : 'production'),
};

export default env;
