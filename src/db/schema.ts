import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: varchar({length: 255}),
    username: varchar({length: 255}).unique(),
    profile_picture: text(),
    github_id: varchar({length: 255}),
    password: varchar({length: 255}),
    accessToken: text(),
});

