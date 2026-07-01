export const USER_TYPES = {
  SUPER_ADMIN: "super_admin",
  INTERNAL: "internal",
  CLIENT: "client",
  PENDING: "pending",
} as const;

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];
