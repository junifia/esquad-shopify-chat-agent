const statuses = ["Invalid", "Forbidden", "NotFound", "Accepted", "Conflict"] as const;

export type Status = (typeof statuses)[number];

export const Status = statuses.reduce(
  (S, s) => Object.assign(S, { [s]: s }),
  {} as { readonly [S in Status]: S },
);

export interface DomainError extends Error {
  readonly status: Status;
}
