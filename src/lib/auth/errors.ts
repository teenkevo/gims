export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: "UNAUTHORIZED" | "FORBIDDEN" = "UNAUTHORIZED"
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message = "Authentication required") {
    super(message, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AuthError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}
