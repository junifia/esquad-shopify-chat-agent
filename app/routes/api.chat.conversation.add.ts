import type { ActionFunctionArgs } from "react-router";

import { chatService } from "app/config";
import { AddConversationSchema } from "app/api/controllers/dto/add-conversation";
import { validateJsonRequest } from "app/utils/validation";

export async function action({ request }: ActionFunctionArgs) {
  const result = await validateJsonRequest(request, AddConversationSchema);

  if (!result.success) {
    return result.response;
  }
  const conversationId = Date.now().toString();

  const newConversation = await chatService.createOrUpdateConversation(
    conversationId,
    result.data.shopDomain,
    result.data.userId,
  );
  return Response.json(newConversation, { status: 201 });
}
