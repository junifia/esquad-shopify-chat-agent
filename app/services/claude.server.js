/**
 * Claude Service
 * Manages interactions with the Claude API
 */
import { Anthropic } from "@anthropic-ai/sdk";
import AppConfig from "./config.server";
import { shopSettingService } from "../config";
/**
 * Creates a Claude service instance
 * @param {string} apiKey - Claude API key
 * @returns {Object} Claude service with methods for interacting with Claude API
 */
export function createClaudeService(apiKey = process.env.CLAUDE_API_KEY) {
  // Initialize Claude client
  const anthropic = new Anthropic({ apiKey });

  /**
   * Streams a conversation with Claude
   * @param {Object} params - Stream parameters
   * @param {Array} params.messages - Conversation history
   * @param {Array} params.tools - Available tools for Claude
   * @param {Object} streamHandlers - Stream event handlers
   * @param {Function} streamHandlers.onText - Handles text chunks
   * @param {Function} streamHandlers.onMessage - Handles complete messages
   * @param {Function} streamHandlers.onToolUse - Handles tool use requests
   * @returns {Promise<Object>} The final message
   */
  const streamConversation = async (
    { messages, shopDomain, tools },
    streamHandlers,
  ) => {
    // Get system prompt from configuration
    const systemPrompt = await shopSettingService.getSystemPrompt(shopDomain);
    // Create stream
    const stream = anthropic.messages.stream({
      model: AppConfig.api.defaultModel,
      max_tokens: AppConfig.api.maxTokens,
      system: systemPrompt,
      messages,
      tools: tools && tools.length > 0 ? tools : undefined,
    });

    // Set up event handlers
    if (streamHandlers.onText) {
      stream.on("text", streamHandlers.onText);
    }

    if (streamHandlers.onMessage) {
      stream.on("message", streamHandlers.onMessage);
    }

    if (streamHandlers.onContentBlock) {
      stream.on("contentBlock", streamHandlers.onContentBlock);
    }

    // Wait for final message
    const finalMessage = await stream.finalMessage();

    // Process tool use requests
    if (streamHandlers.onToolUse && finalMessage.content) {
      for (const content of finalMessage.content) {
        if (content.type === "tool_use") {
          await streamHandlers.onToolUse(content);
        }
      }
    }

    return finalMessage;
  };

  return {
    streamConversation,
  };
}

export default {
  createClaudeService,
};
