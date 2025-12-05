import { z } from "zod";

export const MessageSchema = z.object({
  conversationId: z.string(),
  role: z.string(),
  content: z.string(),
});
