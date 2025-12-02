window.shopChatUrlService = {
  getBackendUrl() {
    return this.isProdEnv() ? "/apps/esquad-backend" : "http://localhost:3000";
  },

  getChatUrl() {
    return `${this.getBackendUrl()}/chat`;
  },

  async getChatHistoryUrl(params) {
    if (this.isProdEnv()) {
      return "/apps/esquad-backend/chat?";
    } else {
      const shopifyAppProxySignature =
        await this.getShopifyAppProxyContext(params);
      return `${this.getBackendUrl()}/chat?${shopifyAppProxySignature.queryParams}`;
    }
  },

  async getChatStreamUrl() {
    const shopifyAppProxySignature = await this.getShopifyAppProxyContext();

    return this.isProdEnv()
      ? `${window.shopChatConfig.backendUrl}/chat?${shopifyAppProxySignature.queryParams}`
      : `${this.getBackendUrl()}/chat?${shopifyAppProxySignature.queryParams}`;
  },

  getShopifyAppProxyContext: async function (params) {
    const response = await fetch(
      params
        ? `/apps/esquad-backend/shopify/appproxy/signature?${params}`
        : "/apps/esquad-backend/shopify/appproxy/signature",
    );
    if (!response.ok) {
      throw new Error("Can't get the shopify signature context");
    }
    return await response.json();
  },

  isProdEnv() {
    return window.shopChatConfig.env === "production";
  },
};
