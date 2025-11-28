import type { ActionFunctionArgs } from "react-router";

import { chatService } from "app/config";
import { AddConversationSchema } from "app/api/controllers/dto/add-conversation";

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json();
  const validatedData = AddConversationSchema.parse(body);

  const conversationId = Date.now().toString();

  const newConversation = await chatService.createOrUpdateConversation(
    conversationId,
    validatedData.shopDomain,
  );
  return Response.json(newConversation, { status: 201 });
}
