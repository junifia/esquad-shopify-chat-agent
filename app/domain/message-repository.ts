import type { Message } from "./message";

export interface MessageRepository {
  save(
    conversationId: string,
    role: string,
    content: string,
    shopDomain?: string,
  ): Promise<Message>;
  find(conversationId: string): Promise<Message[]>;
}
