import type { z } from "zod";

const PARSE_ERROR = Symbol("PARSE_ERROR");

export async function validateJsonRequest<T extends z.ZodTypeAny>(
  request: Request,
  schema: T,
): Promise<
  { success: true; data: z.infer<T> } | { success: false; response: Response }
> {
  const body = await request.json().catch(() => PARSE_ERROR);
  if (body === PARSE_ERROR) {
    return {
      success: false,
      response: Response.json({ error: "Invalid JSON body" }, { status: 400 }),
    };
  }

  const validation = schema.safeParse(body);

  if (!validation.success) {
    return {
      success: false,
      response: Response.json(
        {
          error: "Validation error",
          details: validation.error.flatten(),
        },
        { status: 400 },
      ),
    };
  }

  return { success: true, data: validation.data };
}
