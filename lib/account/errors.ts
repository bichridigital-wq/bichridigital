export type AccountErrorCode =
  | "unauthorized"
  | "invalid_request"
  | "invalid_profile"
  | "device_not_found"
  | "device_conflict"
  | "program_not_found"
  | "program_inactive"
  | "limit_reached"
  | "rate_limited"
  | "account_delete_failed"
  | "internal_error";

export class AccountError extends Error {
  readonly status: number;
  readonly code: AccountErrorCode;

  constructor(
    status: number,
    code: AccountErrorCode,
    message: string,
  ) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
