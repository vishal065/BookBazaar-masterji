import { pgTable, varchar, boolean, timestamp, uuid } from "drizzle-orm/pg-core"

export const usersModel = pgTable("users", {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    isAdmin: boolean("is_admin").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    lastLogin: timestamp("last_login").defaultNow(),
})