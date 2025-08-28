export enum OrderStatus {
  Pending = "pending",
  fulfilled = "fulfilled",
  Cancelled = "cancelled",
  Failed = "failed",
}

export enum PaymentStatus {
  Pending = "pending",
  Paid = "paid",
  Failed = "failed",
  Refunded = "refunded",
}

export enum UserRole {
  Admin = "ADMIN",
  Customer = "CUSTOMER",
}
