import { Conversation, Message } from "./message";

export interface MessageRepository
{
  save(
    conversationId: string,
    role: string,
    content: string,
    shopDomain?: string
  ): Promise<Message>;
  get(conversationId: string): Promise<Message[]>;
}
