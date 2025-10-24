import { CustomerAccountUrls } from "./customerAccountUrls";
import { CustomerToken } from "./customerToken";
import { Conversation, Message } from "./message";

export interface ChatRepository
{
  storeCodeVerifier(state: string, verifier: string): Promise<object>;
  getCodeVerifier(state: string): Promise<object | null>;
  storeCustomerToken(
    conversationId: string,
    accessToken: string,
    expiresAt: string,
  ): Promise<CustomerToken>;
  getCustomerToken(conversationId: string): Promise<CustomerToken | null>;
  createOrUpdateConversation(conversationId: string, shopDomain:string): Promise<object>;
  saveMessage(
    conversationId: string,
    role: string,
    content: string,
    shopDomain?: string
  ): Promise<Message>;
  getConversationHistory(conversationId: string): Promise<Message[]>;

  storeCustomerAccountUrls({
    conversationId,
    mcpApiUrl,
    authorizationUrl,
    tokenUrl,
  }): Promise<object>;

  getCustomerAccountUrls(conversationId: string): Promise<CustomerAccountUrls | null>;

  getShopConversationHistory(shopDomainHash: string, startAfterCreateAt?: number|null, limit?: number): Promise<Conversation[]>;
}
