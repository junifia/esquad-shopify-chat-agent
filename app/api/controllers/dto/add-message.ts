import { z } from "zod";

export const MessageSchema = z.object({
  conversationId: z.number(),
  role: z.string(),
  content: z.string(),
});
