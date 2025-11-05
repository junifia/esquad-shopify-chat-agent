import { Firestore } from "@google-cloud/firestore";
import { ChatRepository } from "app/domain/chat-repository";
import { Conversation, Message } from "app/domain/message";

export class FirestoreChatRepository implements ChatRepository {
  firestore: Firestore;
  constructor(firestore: Firestore) {
    this.firestore = firestore;
  }

  async createOrUpdateConversation(conversationId: string, shopDomain: string): Promise<object> {
    try {
      const docRef = this.firestore.collection('conversation').doc(conversationId);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        return await docRef.update({
          updatedAt: new Date(),
        });
      }

      return await docRef.set({
        id: conversationId,
        shopDomain: shopDomain,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error creating/updating conversation:', error);
      throw error;
    }
  }

  async saveMessage(conversationId: string, role: string, content: string): Promise<Message> {
    try {
      //await this.createOrUpdateConversation(conversationId, shopDomain);

      const message = {
        conversationId,
        role,
        content,
        createdAt: new Date(),
      };
      const docRef = await this.firestore.collection('conversation').doc(conversationId).collection('messages').add(message);
      return { id: docRef.id, ...message } as Message;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  async getConversationHistory(conversationId: string): Promise<Message[]> {
    try {
      const messagesRef = this.firestore.collection('conversation').doc(conversationId).collection('messages');
      const snapshot = await messagesRef
        .orderBy('createdAt', 'asc')
        .get();

      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Message[];
    } catch (error) {
      console.error('Error retrieving conversation history:', error);
      return [];
    }
  }

  async getShopConversationHistory(shopDomainHash: string): Promise<Conversation[]> {
    const ref = this.firestore.collection('conversation').where('shopDomain', '==', shopDomainHash).orderBy('createdAt', 'desc');
    const snapshot = await ref.get();
    const conversations: Conversation[] = snapshot.docs.map((doc) => {
      const data = doc.data() as Conversation;
      return data;
    });

    return conversations;
  }
}
