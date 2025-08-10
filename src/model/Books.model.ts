import { integer, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const Books = pgTable("books", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    author: text("author"),
    genre: text("genre"),
    description: text("description"),
    isbn: text("isbn").notNull().unique(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    stock: integer("stock").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull()
});
