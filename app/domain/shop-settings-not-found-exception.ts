import { DomainError, Status } from './domain-error';

export class ShopSettingsNotFound extends Error implements DomainError {
  readonly status = Status.NotFound;
  readonly message = 'Shop settings not found';
}
