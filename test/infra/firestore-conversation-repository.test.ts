import { describe, it, expect, vi, beforeEach } from "vitest";
import { FirestoreConversationRepository } from "app/infrastructure/firestore-conversation-repository";
import { Firestore } from "@google-cloud/firestore";
import { ConversationNotFound } from "app/domain/conversation-not-found-exception";

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

describe("FirestoreConversationRepository", () => {
  let repository: FirestoreConversationRepository;
  let firestoreMock: any;
  let queryBuilderMock: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the query chain
    queryBuilderMock = {
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      get: vi.fn(),
    };

    // Mock the collection reference and withConverter
    const collectionRefMock = {
      withConverter: vi.fn().mockReturnValue(queryBuilderMock),
    };

    // Mock the Firestore instance
    firestoreMock = {
      collection: vi.fn().mockReturnValue(collectionRefMock),
    };

    repository = new FirestoreConversationRepository(
      firestoreMock as unknown as Firestore,
    );
  });

  describe("findLastByUserId", () => {
    const shopDomain = "test-shop.myshopify.com";
    const userId = "user-123";
    const conversationData = {
      id: "conv-1",
      shopDomain,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should return the conversation when it exists", async () => {
      const snapshotMock = {
        empty: false,
        docs: [
          {
            data: vi.fn().mockReturnValue(conversationData),
          },
        ],
      };
      queryBuilderMock.get.mockResolvedValue(snapshotMock);

      const result = await repository.findLastByUserId(shopDomain, userId);

      // Verify Firestore collection was accessed correctly
      expect(firestoreMock.collection).toHaveBeenCalledWith("conversation");

      // Verify query construction
      expect(queryBuilderMock.where).toHaveBeenCalledWith(
        "shopDomain",
        "==",
        shopDomain,
      );
      expect(queryBuilderMock.where).toHaveBeenCalledWith(
        "userId",
        "==",
        userId,
      );
      expect(queryBuilderMock.orderBy).toHaveBeenCalledWith(
        "createdAt",
        "desc",
      );
      expect(queryBuilderMock.limit).toHaveBeenCalledWith(1);

      // Verify result
      expect(result).toEqual(conversationData);
    });

    it("should throw ConversationNotFound when no conversation exists", async () => {
      const snapshotMock = {
        empty: true,
        docs: [],
      };
      queryBuilderMock.get.mockResolvedValue(snapshotMock);

      await expect(
        repository.findLastByUserId(shopDomain, userId),
      ).rejects.toThrow(ConversationNotFound);
    });
  });
});
