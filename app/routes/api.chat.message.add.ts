import type { ActionFunctionArgs } from "react-router";

import { chatService } from "app/config";
import { MessageSchema } from "app/api/controllers/dto/add-message";
import { validateJsonRequest } from "app/utils/validation";

export async function action({ request }: ActionFunctionArgs) {
  const result = await validateJsonRequest(request, MessageSchema);

  if (!result.success) {
    return result.response;
  }

  const savedMessage = await chatService.saveMessage(
    result.data.conversationId.toString(),
    result.data.role,
    result.data.content,
  );
  return Response.json(savedMessage, { status: 201 });
}
