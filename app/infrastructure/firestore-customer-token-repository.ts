import { Firestore } from "@google-cloud/firestore";
import { CustomerTokenRepository } from "app/domain/customer-token-repository";
import { CustomerToken } from "app/domain/customer-token";

export class FirestoreCustomerTokenRepository implements CustomerTokenRepository {
  firestore: Firestore;
  constructor(firestore: Firestore) {
    this.firestore = firestore;
  }

    async save(conversationId: string, accessToken: string, expiresAt: string): Promise<CustomerToken> {
      try {
        const tokensRef = this.firestore.collection('customerToken');
        const snapshot = await tokensRef
          .where('conversationId', '==', conversationId)
          .limit(1)
          .get();
  
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const dataToUpdate = {
            accessToken,
            expiresAt: new Date(expiresAt),
            updatedAt: new Date(),
          };
          await doc.ref.update(dataToUpdate);
          return { id: doc.id, ...doc.data(), ...dataToUpdate } as CustomerToken;
        }
  
        const dataToCreate = {
          conversationId,
          accessToken,
          expiresAt: new Date(expiresAt),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const docRef = await tokensRef.add(dataToCreate);
        return { id: docRef.id, ...dataToCreate } as CustomerToken;
      } catch (error) {
        console.error('Error storing customer token:', error);
        throw error;
      }
    }
  
    async find(conversationId: string): Promise<CustomerToken | null> {
      try {
        const tokensRef = this.firestore.collection('customerToken');
        const snapshot = await tokensRef
          .where('conversationId', '==', conversationId)
          .where('expiresAt', '>', new Date())
          .limit(1)
          .get();
  
        if (snapshot.empty) {
          return null;
        }
  
        const doc = snapshot.docs[0];
        const token = { id: doc.id, ...doc.data() };
  
        return token as CustomerToken;
      } catch (error) {
        console.error('Error retrieving customer token:', error);
        return null;
      }
    }

}