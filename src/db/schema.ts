import { relations } from "drizzle-orm";
import {
	boolean,
	date,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const visibilityEnum = pgEnum("visibility", ["PRIVATE", "PUBLIC"]);
export const packageEnum = pgEnum("package_name", ["MINI", "MEDIUM", "MEGA"]);
export const paymentStatusEnum = pgEnum("status", ["pending", "success", "rejected", "failed"]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }),
	email: varchar({ length: 255 }).unique(),
	username: varchar({ length: 255 }).unique(),
	profile_picture: text(),
	github_id: varchar({ length: 255 }),
	password: varchar({ length: 255 }),
	accessToken: text(),
	is_verified: boolean().notNull().default(false),
	coin: integer("coin").notNull().default(100),
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

export const detailRepositories = pgTable("detail_repositories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	version: integer().notNull(),
	content: text().notNull(),
	repository_id: uuid().notNull(),
	created_at: timestamp().defaultNow(),
	updated_at: timestamp(),
});

export const orders = pgTable("orders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	invoice: varchar().notNull(),
	package_name: packageEnum().notNull(),
	date: date().defaultNow(),
	amount: integer().notNull(),
	user_id: uuid().notNull(),
	status: paymentStatusEnum().default("pending").notNull(),
	created_at: timestamp().defaultNow(),
	updated_at: timestamp(),
})
	;
export const usersRelations = relations(users, ({ many }) => ({
	repositories: many(repositories),
	orders: many(orders)
}));

export const repositoriesRelations = relations(repositories, ({ one, many }) => ({
	user: one(users, {
		fields: [repositories.user_id],
		references: [users.id],
	}),
	detailRepositories: many(detailRepositories)
}));

export const detailRepositoriesRelations = relations(detailRepositories, ({ one }) => ({
	repositories: one(repositories, {
		fields: [detailRepositories.repository_id],
		references: [repositories.id]
	})
}))

export const ordersRelations = relations(orders, ({ one }) => ({
	users: one(users, {
		fields: [orders.user_id],
		references: [users.id]
	})
}));