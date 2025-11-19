import { DomainError, Status } from "./domain-error";

export class ShopSettingsAlreadyExist extends Error implements DomainError {
  readonly status = Status.NotFound;
  readonly message = "Shop settings already exist";
}
