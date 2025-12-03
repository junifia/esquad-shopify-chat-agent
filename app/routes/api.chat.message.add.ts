import type { ActionFunctionArgs } from "react-router";

import { chatService } from "app/config";
import { MessageSchema } from "app/api/controllers/dto/add-message";

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json();
  const validatedData = MessageSchema.parse(body);

  const savedMessage = await chatService.saveMessage(
    validatedData.conversationId.toString(),
    validatedData.role,
    validatedData.content,
  );
  return Response.json(savedMessage, { status: 201 });
}
