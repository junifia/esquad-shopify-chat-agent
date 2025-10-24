import { ChatRepository } from "app/domain/chat-repository";
import { CustomerAccountUrls } from "app/domain/customerAccountUrls";
import { CustomerToken } from "app/domain/customerToken";
import { Message } from "app/domain/message";

export class ChatService
{
  private chatRepository: ChatRepository;
  constructor(chatRepository: ChatRepository){
    this.chatRepository = chatRepository;
  }


  async storeCodeVerifier(state: string, verifier: string): Promise<object>{
    return await this.chatRepository.storeCodeVerifier(state, verifier);
  }

  async getCodeVerifier(state: string): Promise<object|null> {
    return await this.chatRepository.getCodeVerifier(state);
  }

  async storeCustomerToken(
    conversationId: string,
    accessToken: string,
    expiresAt: string,
  ) {
    return await this.chatRepository.storeCustomerToken(conversationId, accessToken, expiresAt);
  }

  async getCustomerToken(conversationId: string): Promise<CustomerToken|null> {
    return await this.chatRepository.getCustomerToken(conversationId);
  }

  async createOrUpdateConversation(conversationId: string, shopDomain: string): Promise<object> {
    return await this.chatRepository.createOrUpdateConversation(conversationId, shopDomain);
  }

  async saveMessage(
    conversationId: string,
    role: string,
    content: string,
    shopDomain?: string
  ): Promise<Message> {
    if (shopDomain) {
      this.createOrUpdateConversation(conversationId, shopDomain);
    }

    return await this.chatRepository.saveMessage(conversationId, role, content);
  }

  async getConversationHistory(conversationId: string): Promise<Message[]> {
    return await this.chatRepository.getConversationHistory(conversationId);
  }

  async storeCustomerAccountUrls({
    conversationId,
    mcpApiUrl,
    authorizationUrl,
    tokenUrl,
  }): Promise<object> {
    return this.chatRepository.storeCustomerAccountUrls({conversationId, mcpApiUrl, authorizationUrl, tokenUrl});
  }

  async getCustomerAccountUrls(conversationId: string): Promise<CustomerAccountUrls|null> {
    return await this.chatRepository.getCustomerAccountUrls(conversationId);
  }

  async getShopConversationHistory(shopDomain: string){
    return await this.chatRepository.getShopConversationHistory(`https://${shopDomain}`);
  }
}
