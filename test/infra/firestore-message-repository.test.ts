import { describe, it, expect, vi, beforeEach } from "vitest";
import { FirestoreMessageRepository } from "app/infrastructure/firestore-message-repository";
import { Firestore } from "@google-cloud/firestore";
import { Message } from "app/domain/message";

// Mock Firestore
vi.mock("@google-cloud/firestore", () => {
  return {
    Firestore: vi.fn(),
    Timestamp: {
      now: vi.fn(),
      fromDate: vi.fn(),
    },
  };
});

describe("FirestoreMessageRepository", () => {
  let repository: FirestoreMessageRepository;
  let firestoreMock: any;
  let typedCollectionMock: any;
  let messagesCollectionMock: any;
  let conversationDocMock: any;
  let conversationCollectionMock: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the query chain and typed collection
    typedCollectionMock = {
      add: vi.fn(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      get: vi.fn(),
    };

    // Mock the intermediate collections and docs
    messagesCollectionMock = {
      withConverter: vi.fn().mockReturnValue(typedCollectionMock),
    };

    conversationDocMock = {
      collection: vi.fn().mockReturnValue(messagesCollectionMock),
    };

    conversationCollectionMock = {
      doc: vi.fn().mockReturnValue(conversationDocMock),
    };

    firestoreMock = {
      collection: vi.fn().mockReturnValue(conversationCollectionMock),
    };

    repository = new FirestoreMessageRepository(
      firestoreMock as unknown as Firestore,
    );
  });

  describe("save", () => {
    it("should save the message and return the created document data", async () => {
      const conversationId = "conv-123";
      const role = "user";
      const content = "Hello world";

      const savedMessage: Message = {
        conversationId,
        role,
        content,
        createdAt: new Date(),
      };

      const docRefMock = {
        get: vi.fn().mockResolvedValue({
          data: vi.fn().mockReturnValue(savedMessage),
        }),
      };

      typedCollectionMock.add.mockResolvedValue(docRefMock);

      const result = await repository.save(conversationId, role, content);

      // Verify chain navigation
      expect(firestoreMock.collection).toHaveBeenCalledWith("conversation");
      expect(conversationCollectionMock.doc).toHaveBeenCalledWith(
        conversationId,
      );
      expect(conversationDocMock.collection).toHaveBeenCalledWith("messages");

      // Verify add call
      expect(typedCollectionMock.add).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationId,
          role,
          content,
          createdAt: expect.any(Date),
        }),
      );

      // Verify result
      expect(result).toEqual(savedMessage);
    });
  });

  describe("find", () => {
    it("should return messages in reverse order of retrieval (ascending by createdAt)", async () => {
      const conversationId = "conv-123";
      const msg1 = {
        conversationId,
        role: "user",
        content: "First",
        createdAt: new Date("2023-01-01T10:00:00Z"),
      };
      const msg2 = {
        conversationId,
        role: "assistant",
        content: "Second",
        createdAt: new Date("2023-01-01T10:00:05Z"),
      };

      // Repository requests "desc" order, so DB returns [Newest, Oldest]
      const dbDocs = [msg2, msg1];

      const snapshotMock = {
        docs: dbDocs.map((data) => ({
          data: vi.fn().mockReturnValue(data),
        })),
      };

      typedCollectionMock.get.mockResolvedValue(snapshotMock);

      const result = await repository.find(conversationId);

      // Verify chain navigation
      expect(firestoreMock.collection).toHaveBeenCalledWith("conversation");
      expect(conversationCollectionMock.doc).toHaveBeenCalledWith(
        conversationId,
      );
      expect(conversationDocMock.collection).toHaveBeenCalledWith("messages");

      // Verify query constraints
      expect(typedCollectionMock.orderBy).toHaveBeenCalledWith(
        "createdAt",
        "desc",
      );
      expect(typedCollectionMock.limit).toHaveBeenCalledWith(50);

      // Result should be reversed from DB return (so [Oldest, Newest])
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(msg1);
      expect(result[1]).toEqual(msg2);
    });
  });
});
