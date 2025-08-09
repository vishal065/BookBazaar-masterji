import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersModel } from "./user.model";

const apiKeysModel = pgTable("api_keys", {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    userId: uuid("user_id")
        .notNull()
        .references(() => usersModel.id),
    isActive: boolean("is_active").default(true),
});

export { apiKeysModel }
