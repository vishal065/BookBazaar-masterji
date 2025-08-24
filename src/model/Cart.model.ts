import { integer, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { Users } from "./user.model";
import { Books } from "./Books.model";

export const CartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => Users.id)
    .notNull(),
  bookId: uuid("book_id")
    .references(() => Books.id, { onDelete: "cascade" })
    .notNull(),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
