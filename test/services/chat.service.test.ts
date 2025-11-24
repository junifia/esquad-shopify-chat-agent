import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ChatService } from '../../app/services/chat.service'

const mockConversationRepo = {
  upsert: vi.fn(),
  findAllByShop: vi.fn(),
}

const mockMessageRepo = {
  save: vi.fn(),
  find: vi.fn(),
}

const mockCodeVerifierRepo = {
  save: vi.fn(),
  find: vi.fn(),
}

const mockCustomerTokenRepo = {
  save: vi.fn(),
  find: vi.fn(),
}

const mockCustomerAccountUrlsRepo = {
  save: vi.fn(),
  find: vi.fn(),
}

describe('ChatService - Hello World Tests', () => {
  let chatService: ChatService

  beforeEach(() => {
    vi.clearAllMocks()
    
    chatService = new ChatService(
      mockConversationRepo,
      mockMessageRepo,
      mockCodeVerifierRepo,
      mockCustomerTokenRepo,
      mockCustomerAccountUrlsRepo
    )
  })

  it('should store a code verifier successfully', async () => {
    const mockVerifier = { id: '123', state: 'test-state', verifier: 'test-verifier' }
    mockCodeVerifierRepo.save.mockResolvedValue(mockVerifier)

    const result = await chatService.storeCodeVerifier('test-state', 'test-verifier')

    expect(mockCodeVerifierRepo.save).toHaveBeenCalledWith('test-state', 'test-verifier')
    expect(result).toEqual(mockVerifier)
  })

  it('should retrieve a code verifier successfully', async () => {
    const mockVerifier = { id: '123', state: 'test-state', verifier: 'test-verifier' }
    mockCodeVerifierRepo.find.mockResolvedValue(mockVerifier)

    const result = await chatService.getCodeVerifier('test-state')

    expect(mockCodeVerifierRepo.find).toHaveBeenCalledWith('test-state')
    expect(result).toEqual(mockVerifier)
  })

  it('should return null when code verifier not found', async () => {
    mockCodeVerifierRepo.find.mockResolvedValue(null)

    const result = await chatService.getCodeVerifier('non-existent-state')

    expect(mockCodeVerifierRepo.find).toHaveBeenCalledWith('non-existent-state')
    expect(result).toBeNull()
  })

  it('should have all required dependencies injected', () => {
    expect(chatService).toBeDefined()
    // Test that the service was constructed properly
    expect(chatService.storeCodeVerifier).toBeDefined()
    expect(chatService.getCodeVerifier).toBeDefined()
  })
})