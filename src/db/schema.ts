import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const visibilityEnum = pgEnum("visibility", ["PRIVATE", "PUBLIC"]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }),
	email: varchar({ length: 255 }).unique(),
	username: varchar({ length: 255 }).unique(),
	profile_picture: text(),
	github_id: varchar({ length: 255 }),
	password: varchar({ length: 255 }),
	accessToken: text(),
	credit: integer().default(0),
	is_verified: boolean().notNull().default(false),
	coin: integer("coin").notNull().default(0),
});

export const repositories = pgTable("repositories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	visibility: visibilityEnum().notNull(),
	user_id: uuid().notNull(),
	is_have_readme: boolean().notNull(),
	created_at: timestamp().defaultNow(),
	updated_at: timestamp(),
});

export const usersRelations = relations(users, ({ many }) => ({
	repositories: many(repositories),
}));

export const repositoriesRelations = relations(repositories, ({ one }) => ({
	user: one(users, {
		fields: [repositories.user_id],
		references: [users.id],
	}),
}));
