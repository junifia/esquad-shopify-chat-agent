import { Firestore, Timestamp } from "@google-cloud/firestore";
import { MessageRepository } from "app/domain/message-repository";
import { Message } from "app/domain/message";

const messageConverter = {
  toFirestore(data: Message): FirebaseFirestore.DocumentData {
    return {
      conversationId: data.conversationId,
      role: data.role,
      content: data.content,
      createdAt: data.createdAt,
    };
  },
  fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): Message {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      conversationId: data.conversationId,
      role: data.role,
      content: data.content,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : data.createdAt,
    };
  }
};

export class FirestoreMessageRepository implements MessageRepository {
  private readonly customerAccountUrlsCollection: FirebaseFirestore.CollectionReference<Message>;
  constructor(private readonly firestore: Firestore) {
    this.customerAccountUrlsCollection = this.firestore.collection('conversation').doc().collection('messages').withConverter(messageConverter);
  }

  private getMessagesCollection(conversationId: string): FirebaseFirestore.CollectionReference<Message> {
    return this.firestore
      .collection('conversation')
      .doc(conversationId)
      .collection('messages')
      .withConverter(messageConverter);
  }

  async save(conversationId: string, role: 'user' | 'assistant', content: string): Promise<Message> {
    const message = {
      conversationId,
      role,
      content,
      createdAt: new Date(),
    };
    const docRef = await this.getMessagesCollection(conversationId).add(message);
    return { id: docRef.id, ...message };
  }

  async get(conversationId: string): Promise<Message[]> {
    const messagesRef = this.getMessagesCollection(conversationId);
    const snapshot = await messagesRef
      .orderBy('createdAt', 'asc')
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }
}
