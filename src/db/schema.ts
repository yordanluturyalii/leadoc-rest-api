import { pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const visibilityEnum = pgEnum('visibility', ['PRIVATE', 'PUBLIC']);

export const users = pgTable("users", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: varchar({ length: 255 }),
  email: varchar({length: 255}).unique(),
  username: varchar({ length: 255 }).unique(),
  profile_picture: text(),
  github_id: varchar({ length: 255 }),
  password: varchar({ length: 255 }),
  accessToken: text(),
});


export const repositories = pgTable("repositories", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
  visibility: visibilityEnum().notNull(),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp(),
});
