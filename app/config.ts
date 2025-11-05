import { Firestore } from '@google-cloud/firestore';
import { StoreSessionStorageService } from './services/sessionStorage.service';
import { FirestoreSessionStorageRepository } from './infrastructure/firestore-session-repository';
import { FirestoreChatRepository } from './infrastructure/firestore-chat-repository';
import { ChatService } from './services/chat.service';
import { FirestoreCodeVerifier } from './infrastructure/firestore-code-verifier';
import { FirestoreCustomerTokenRepository } from './infrastructure/firestore-customer-token-repository';
import { FirestoreCustomerAccountUrlsRepository } from './infrastructure/firestore-customer-account-urls-repository';
let firestore: Firestore;

if (process.env.NODE_ENV !== 'production') {
  firestore = new Firestore({
    projectId: process.env.GCP_PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });
} else {
  firestore = new Firestore();
}

const storeSessionStorageRepository = new FirestoreSessionStorageRepository(firestore);

const storeSessionStorageService = new StoreSessionStorageService(storeSessionStorageRepository);

const chatRepository = new FirestoreChatRepository(firestore);

const codeVerifierRepository = new FirestoreCodeVerifier(firestore);

const customerTokenRepository = new FirestoreCustomerTokenRepository(firestore);

const customerAccountUrlsRepository = new FirestoreCustomerAccountUrlsRepository(firestore);

const chatService = new ChatService(chatRepository, codeVerifierRepository, customerTokenRepository, customerAccountUrlsRepository);

export { 
  firestore, 
  storeSessionStorageService, 
  chatRepository,
  chatService, 
  customerTokenRepository, 
  codeVerifierRepository, 
  customerAccountUrlsRepository 
  };
