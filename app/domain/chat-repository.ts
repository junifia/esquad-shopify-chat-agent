import { Conversation, Message } from "./message";

export interface ChatRepository
{
  createOrUpdateConversation(conversationId: string, shopDomain:string): Promise<object>;
  saveMessage(
    conversationId: string,
    role: string,
    content: string,
    shopDomain?: string
  ): Promise<Message>;
  getConversationHistory(conversationId: string): Promise<Message[]>;

  getShopConversationHistory(shopDomainHash: string, startAfterCreateAt?: number|null, limit?: number): Promise<Conversation[]>;
}
