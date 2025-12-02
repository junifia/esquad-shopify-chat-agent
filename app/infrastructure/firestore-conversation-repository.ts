import { Firestore, Timestamp } from "@google-cloud/firestore";
import { Conversation } from "app/domain/message";
import { ConversationRepository } from "app/domain/conversation-repository";
import { ConversationNotFound } from "app/domain/conversation-not-found-exception";

const conversationConverter = {
  toFirestore(data: Conversation): FirebaseFirestore.DocumentData {
    return {
      id: data.id,
      shopDomain: data.shopDomain,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      userId: data.userId,
    };
  },
  fromFirestore(
    snapshot: FirebaseFirestore.QueryDocumentSnapshot,
  ): Conversation {
    const data = snapshot.data();
    return {
      id: data.id,
      shopDomain: data.shopDomain,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : data.createdAt,
      updatedAt:
        data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate()
          : data.updatedAt,
      userId: data.userId,
    };
  },
};

export class FirestoreConversationRepository implements ConversationRepository {
  private readonly conversationCollection: FirebaseFirestore.CollectionReference<Conversation>;

  constructor(firestore: Firestore) {
    this.conversationCollection = firestore
      .collection("conversation")
      .withConverter(conversationConverter);
  }

  async findLastByUserId(
    shopDomain: string,
    userId: string,
  ): Promise<Conversation> {
    const ref = this.conversationCollection
      .where("shopDomain", "==", shopDomain)
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(1);

    const snapshot = await ref.get();

    if (snapshot.empty) {
      throw new ConversationNotFound();
    }
    return snapshot.docs[0].data();
  }

  async upsert(
    conversationId: string,
    shopDomain: string,
    userId: string,
  ): Promise<object> {
    const docRef = this.conversationCollection.doc(conversationId);
    const docSnap = await docRef.get();
    const now = new Date();

    if (docSnap.exists) {
      return await docRef.update({
        updatedAt: now,
      });
    }

    return docRef.set({
      id: conversationId,
      shopDomain: shopDomain,
      createdAt: now,
      updatedAt: now,
      userId: userId,
    });
  }

  async findAllByShop(shopDomain: string): Promise<Conversation[]> {
    const ref = this.conversationCollection
      .where("shopDomain", "==", shopDomain)
      .orderBy("createdAt", "desc");
    const snapshot = await ref.get();
    return snapshot.docs.map((doc) => doc.data());
  }
}
