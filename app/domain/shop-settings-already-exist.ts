import { DomainError, Status } from "./domain-error";

export class ShopSettingsAlreadyExist extends Error implements DomainError {
  readonly status = Status.EntityPresent;
  readonly message = "Shop settings already exist";
}
