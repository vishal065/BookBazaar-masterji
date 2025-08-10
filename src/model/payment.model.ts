import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { Orders } from "./Orders.model";

export const Payments = pgTable("payments", {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id").references(() => Orders.id).notNull(),
    paymentId: text("payment_id").notNull(),
    status: text("status").default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull()
});