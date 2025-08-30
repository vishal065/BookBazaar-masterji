import {
  pgTable,
  uuid,
  integer,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { Books } from "./Books.model";
import { Users } from "./user.model";

export const Reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookId: uuid("book_id")
      .references(() => Books.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => Users.id)
      .notNull(),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at"),
  },
  (t) => [
    // Example of unique index (bookId + userId => a user can only review a book once)
    uniqueIndex("unique_review").on(t.bookId, t.userId),
  ],
);
