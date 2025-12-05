import { DomainError, Status } from "./domain-error";

export class ConversationNotFound extends Error implements DomainError {
  readonly status = Status.NotFound;
  readonly message = "Conversation not found";
}
