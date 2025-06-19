import { pgTable, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    name: varchar()
})

