import { Firestore } from "@google-cloud/firestore";
import { Conversation } from "app/domain/message";
import { ConversationRepository } from "app/domain/conversation-repository";

export class FirestoreConversationRepository implements ConversationRepository {
  firestore: Firestore;
  constructor(firestore: Firestore) {
    this.firestore = firestore;
  }

  async upsert(conversationId: string, shopDomain: string): Promise<object> {
    try {
      const docRef = this.firestore.collection('conversation').doc(conversationId);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        return await docRef.update({
          updatedAt: new Date(),
        });
      }

      return docRef.set({
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

  async getAllByShop(shopDomainHash: string): Promise<Conversation[]> {
    const ref = this.firestore.collection('conversation').where('shopDomain', '==', shopDomainHash).orderBy('createdAt', 'desc');
    const snapshot = await ref.get();
    const conversations: Conversation[] = snapshot.docs.map((doc) => {
      const data = doc.data() as Conversation;
      return data;
    });

    return conversations;
  }
}
