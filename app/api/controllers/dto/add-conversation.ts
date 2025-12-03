import { z } from "zod";

export const AddConversationSchema = z.object({
  shopDomain: z.string(),
  userId: z.string().optional(),
});
