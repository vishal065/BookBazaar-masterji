import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { Users } from "./user.model";

const ApiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),

  userId: uuid("user_id")
    .notNull()
    .references(() => Users.id),

  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export { ApiKeys };
