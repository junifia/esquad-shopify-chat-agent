import { ChatRepository } from "app/domain/chat-repository";
import { CodeVerifierRepository } from "app/domain/code-verifier-repository";
import { CustomerAccountUrls } from "app/domain/customer-account-urls";
import { CustomerAccountUrlsRepository } from "app/domain/customer-account-urls-repository";
import { CustomerToken } from "app/domain/customer-token";
import { CustomerTokenRepository } from "app/domain/customer-token-repository";
import { Message } from "app/domain/message";

export class ChatService
{
  private chatRepository: ChatRepository;
  private codeVerifierRepository: CodeVerifierRepository;
  private customerTokenRepository: CustomerTokenRepository;
  private customerAccountUrlsRepository: CustomerAccountUrlsRepository;

  constructor(chatRepository: ChatRepository, codeVerifierRepository: CodeVerifierRepository, customerTokenRepository: CustomerTokenRepository, customerAccountUrlsRepository: CustomerAccountUrlsRepository){
    this.codeVerifierRepository = codeVerifierRepository;
    this.chatRepository = chatRepository;
    this.customerTokenRepository = customerTokenRepository;
    this.customerAccountUrlsRepository = customerAccountUrlsRepository;
  }


  async storeCodeVerifier(state: string, verifier: string): Promise<object>{
    return await this.codeVerifierRepository.save(state, verifier);
  }

  async getCodeVerifier(state: string): Promise<object|null> {
    return await this.codeVerifierRepository.find(state);
  }

  async storeCustomerToken(
    conversationId: string,
    accessToken: string,
    expiresAt: string,
  ) {
    return await this.customerTokenRepository.save(conversationId, accessToken, expiresAt);
  }

  async getCustomerToken(conversationId: string): Promise<CustomerToken|null> {
    return await this.customerTokenRepository.find(conversationId);
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
    tokenUrl
  }): Promise<CustomerAccountUrls> {
    return await this.customerAccountUrlsRepository.save(conversationId, mcpApiUrl, authorizationUrl, tokenUrl);
  }

  async getCustomerAccountUrls(conversationId: string): Promise<CustomerAccountUrls | null> {
    return await this.customerAccountUrlsRepository.find(conversationId);
  }

  async getShopConversationHistory(shopDomain: string){
    return await this.chatRepository.getShopConversationHistory(`https://${shopDomain}`);
  }
}
