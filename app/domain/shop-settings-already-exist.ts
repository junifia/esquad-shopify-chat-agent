import { DomainError, Status } from "./domain-error";

export class ShopSettingsAlreadyExist extends Error implements DomainError {
  readonly status = Status.Conflict;
  readonly message = "Shop settings already exist";
}
