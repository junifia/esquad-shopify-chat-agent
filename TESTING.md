# Backend Testing Setup for Esquad Shopify Chat Agent

## Overview

This project includes a **backend-focused** unit testing setup using **Vitest** - a fast, modern testing framework optimized for testing business logic, services, and utility functions.

## Testing Stack

- **Vitest**: Modern testing framework with excellent TypeScript integration
- **Node.js Environment**: Pure backend testing without DOM dependencies

## Available Test Commands

```bash
# Run tests once
npm run test:run

# Run tests in watch mode (great for development)
npm run test:watch

# Run tests interactively
npm test
```

## Test Examples

### 1. Service Classes (`test/services/chat.service.test.ts`)
Testing services with mocked dependencies:
```typescript
import { ChatService } from '../../app/services/chat.service'

const mockCodeVerifierRepo = {
  save: vi.fn(),
  find: vi.fn(),
}

describe('ChatService', () => {
  it('should store a code verifier successfully', async () => {
    const mockVerifier = { id: '123', state: 'test-state' }
    mockCodeVerifierRepo.save.mockResolvedValue(mockVerifier)
    
    const result = await chatService.storeCodeVerifier('test-state', 'test-verifier')
    expect(result).toEqual(mockVerifier)
  })
})
```



## Project Structure

```
test/
├── setup.js                     # Global test setup
└── services/
    └── chat.service.test.ts     # Service class tests
```

## Configuration Files

- **`vitest.config.js`**: Main Vitest configuration
- **`test/setup.js`**: Global setup for tests (mocks, test utilities)

## Why This Setup?

1. **Easy Integration**: Vitest works seamlessly with your existing Vite setup
2. **Fast**: Uses the same transformation pipeline as your dev server
3. **TypeScript Support**: Full TypeScript support out of the box
4. **Backend Focus**: Optimized for testing business logic and services
5. **Mocking**: Powerful mocking capabilities for services and dependencies
6. **Lightweight**: No DOM dependencies for faster test execution

## Tips

- Write tests alongside new features
- Use `test:watch` during development for instant feedback
- Focus on business logic and service behavior
- Mock external dependencies (Firestore, Shopify API, etc.)
- Test edge cases and error conditions
- Keep tests fast by avoiding I/O operations

Your Shopify app now has a solid foundation for unit testing! 🎉