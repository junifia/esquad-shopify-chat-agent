import type { Conversation } from "./message";

export interface ConversationRepository {
  findLastByUserId(shopDomain: string, userId: string): Promise<Conversation>;
  upsert(
    conversationId: string,
    shopDomain: string,
    userId: string,
  ): Promise<object>;
  findAllByShop(
    shopDomainHash: string,
    startAfterCreateAt?: number | null,
    limit?: number,
  ): Promise<Conversation[]>;
}
