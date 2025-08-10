import { integer, numeric, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { Books } from "./Books.model";

export const Orders = pgTable("orders", {
    id: uuid("id").primaryKey(),
    userId: integer("user_id").notNull(),
    totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
    status: varchar("status", { length: 50 }).default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull()
});

export const orderItems = pgTable("order_items", {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id").references(() => Orders.id).notNull(),
    bookId: uuid("book_id").references(() => Books.id).notNull(),
    quantity: integer("quantity").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull()
});
