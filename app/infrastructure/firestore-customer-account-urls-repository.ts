import { Firestore } from "@google-cloud/firestore";
import { CustomerAccountUrls } from "app/domain/customer-account-urls";
import { CustomerAccountUrlsRepository } from "app/domain/customer-account-urls-repository";

export class FirestoreCustomerAccountUrlsRepository implements CustomerAccountUrlsRepository {
  firestore: Firestore;
  constructor(firestore: Firestore) {
    this.firestore = firestore;
  }

  async save(
    conversationId: string,
    mcpApiUrl: string,
    authorizationUrl: string,
    tokenUrl: string,
  ): Promise<object> {
    try {
      const docRef = this.firestore
        .collection('customerAccountUrls')
        .doc(conversationId);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        const dataToUpdate = {
          mcpApiUrl,
          authorizationUrl,
          tokenUrl,
          updatedAt: new Date(),
        };
        await docRef.update(dataToUpdate);
        return { ...docSnap.data(), ...dataToUpdate };
      } else {
        const dataToCreate = {
          conversationId,
          mcpApiUrl,
          authorizationUrl,
          tokenUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await docRef.set(dataToCreate);
        return dataToCreate;
      }
    } catch (error) {
      console.error('Error storing customer account URLs:', error);
      throw error;
    }
  }

  async find(conversationId: string): Promise<CustomerAccountUrls | null> {
    try {
      const docRef = this.firestore
        .collection('customerAccountUrls')
        .doc(conversationId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data();

      return data as CustomerAccountUrls;
    } catch (error) {
      console.error('Error retrieving customer account URLs:', error);
      return null;
    }
  }
}
