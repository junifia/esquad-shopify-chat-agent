declare global {
  interface Window {
    shopChatConfig?: {
      env?: "development" | "production";
      backendUrl?: string;
    };
    shopChatUrlService: UrlService;
  }
}

const CONFIG = {
  PROD_URL: undefined,
  PROD_PREFIX: "/apps/esquad-backend",
  DEV_URL: "http://localhost:3000",
  ENDPOINTS: {
    SIGNATURE: "/shopify/app-proxy/signature",
    CHAT: "/chat",
    TOKEN_STATUS: "/auth/token-status",
  },
} as const;

export class UrlService {
  private env: "development" | "production";
  private PROD_URL: string | undefined;

  constructor() {
    this.env = window.shopChatConfig?.env || "development";
    this.PROD_URL = window.shopChatConfig?.backendUrl;
  }

  public isProd(): boolean {
    return this.env === "production";
  }

  private _toQueryString(
    params: Record<string, string | number | boolean> = {},
  ): string {
    if (!params || Object.keys(params).length === 0) return "";

    // URLSearchParams requires string values
    const stringParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      stringParams[key] = String(value);
    }

    const query = new URLSearchParams(stringParams).toString();
    return `?${query}`;
  }

  private async _getProxyContext(paramsString: string = ""): Promise<string> {
    const endpoint = `${CONFIG.PROD_PREFIX}${CONFIG.ENDPOINTS.SIGNATURE}`;
    const url = paramsString ? `${endpoint}?${paramsString}` : endpoint;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to retrieve Shopify app proxy context");
    }
    const data = await response.json();
    return new URLSearchParams(data).toString();
  }

  private async _buildUrl(
    endpoint: string,
    params: Record<string, string | number | boolean> = {},
    requiresSignature: boolean = true,
  ): Promise<string> {
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

  public getBackendUrl(): string {
    return this.isProd() ? CONFIG.PROD_PREFIX : CONFIG.DEV_URL;
  }

  public async getChatStreamUrl(): Promise<string> {
    if (this.isProd()) {
      const signature = await this._getProxyContext();
      return `${this.PROD_URL}${CONFIG.ENDPOINTS.CHAT}?${signature}`;
    }

    return await this._buildUrl(CONFIG.ENDPOINTS.CHAT, {}, true);
  }

  public async getChatHistoryUrl(conversationId: string): Promise<string> {
    const params = {
      history: true,
      conversation_id: conversationId,
    };
    return await this._buildUrl(CONFIG.ENDPOINTS.CHAT, params, true);
  }

  public async getTokenStatusUrl(conversationId: string): Promise<string> {
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
