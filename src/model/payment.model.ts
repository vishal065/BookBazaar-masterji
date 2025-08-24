// src/model/payment.model.ts
import {
  numeric,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { Orders } from "./Orders.model";

export const paymentStatusEnum = pgEnum("status", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const Payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .references(() => Orders.id)
    .notNull(),

  provider: varchar("provider", { length: 50 }).notNull().default("RAZORPAY"),

  providerOrderId: uuid("provider_order_id").notNull().unique(),
  providerPaymentId: uuid("provider_payment_id").notNull().unique(),
  providerSignature: uuid("provider_signature").notNull().unique(),

  status: paymentStatusEnum("status").default("pending").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
