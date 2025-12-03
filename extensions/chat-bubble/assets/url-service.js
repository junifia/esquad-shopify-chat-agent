(() => {
  "use strict";

  const CONFIG = {
    PROD_URL: undefined,
    PROD_PREFIX: "/apps/esquad-backend",
    DEV_URL: "http://localhost:3000",
    ENDPOINTS: {
      SIGNATURE: "/shopify/appproxy/signature",
      CHAT: "/chat",
      TOKEN_STATUS: "/auth/token-status",
    },
  };

  class UrlService {
    constructor() {
      this.env = window.shopChatConfig?.env || "development";
      this.PROD_URL = window.shopChatConfig?.backendUrl;
    }

    isProd() {
      return this.env === "production";
    }

    _toQueryString(params = {}) {
      if (!params || Object.keys(params).length === 0) return "";
      const query = new URLSearchParams(params).toString();
      return `?${query}`;
    }

    async _getProxyContext(paramsString = "") {
      const endpoint = `${CONFIG.PROD_PREFIX}${CONFIG.ENDPOINTS.SIGNATURE}`;
      const url = paramsString ? `${endpoint}?${paramsString}` : endpoint;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to retrieve Shopify app proxy context");
      }
      const data = await response.json();
      return new URLSearchParams(data).toString();
    }

    /**
     * Internal builder to construct URLs based on environment
     * @param {string} endpoint - The API path (e.g. '/chat')
     * @param {Object} params - Query parameters object
     * @param {boolean} requiresSignature - Whether to fetch/append proxy signature (mostly for Dev)
     */
    async _buildUrl(endpoint, params = {}, requiresSignature = true) {
      const queryString = this._toQueryString(params);

      if (this.isProd()) {
        return `${CONFIG.PROD_PREFIX}${endpoint}${queryString}`;
      }

      const baseUrl = CONFIG.DEV_URL;

      if (requiresSignature) {
        const proxyContext = await this._getProxyContext(
          queryString.replace("?", ""),
        );
        return `${baseUrl}${endpoint}?${proxyContext}`;
      }

      return `${baseUrl}${endpoint}${queryString}`;
    }


    getBackendUrl() {
      return this.isProd() ? CONFIG.PROD_PREFIX : CONFIG.DEV_URL;
    }

    async getChatStreamUrl() {
      if (this.isProd()) {
        const signature = await this._getProxyContext();
        return `${this.PROD_URL}${CONFIG.ENDPOINTS.CHAT}?${signature}`;
      }

      return await this._buildUrl(CONFIG.ENDPOINTS.CHAT, {}, true);
    }

    async getChatHistoryUrl(conversationId) {
      const params = {
        history: true,
        conversation_id: conversationId,
      };
      return await this._buildUrl(CONFIG.ENDPOINTS.CHAT, params, true);
    }

    async getTokenStatusUrl(conversationId) {
      return await this._buildUrl(
        CONFIG.ENDPOINTS.TOKEN_STATUS,
        {
          conversation_id: conversationId,
        },
        false,
      );
    }
  }

  window.shopChatUrlService = new UrlService();
})();
