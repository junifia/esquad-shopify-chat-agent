import { ChatRepository } from "app/domain/chat-repository";

export class ChatService
{
  private chatRepository: ChatRepository;
  constructor(chatRepository: ChatRepository){
    this.chatRepository = chatRepository;
  }

  getShopConversationHistory(shopDomain: string){
    const buffer = Buffer.from(`https://${shopDomain}`, 'utf-8');
    const base64EncodedShopDomain = buffer.toString('base64');
    return this.chatRepository.getShopConversationHistory(base64EncodedShopDomain);
  }
}
