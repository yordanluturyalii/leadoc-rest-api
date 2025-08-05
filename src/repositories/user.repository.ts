import { eq } from "drizzle-orm";
import type {
	NodePgDatabase,
	NodePgTransaction,
} from "drizzle-orm/node-postgres";
import { Service } from "typedi";
import { db } from "../db/db";
import { User } from "../db/models/user.model";
import { users } from "../db/schema";

type Executor = NodePgDatabase | NodePgTransaction<any, any>;

@Service()
export class UserRepository {
	async create(
		tx: Executor,
		name: string,
		email?: string,
		username?: string,
		github_id?: string,
		profile_picture?: string,
		password?: string,
		accessToken?: string,
	) {
		try {
			await tx.insert(users).values({
				name,
				email,
				username,
				github_id,
				profile_picture,
				password,
				accessToken,
			});
		} catch (error) {
			return error;
		}
	}

	async findByGithubId(id: string) {
		const user = await db.select().from(users).where(eq(users.github_id, id));
		return user[0]
			? new User(
					user[0]?.id,
					user[0]?.name,
					user[0]?.email,
					user[0]?.username,
					user[0]?.profile_picture,
					user[0]?.github_id,
					user[0]?.password,
					user[0].accessToken,
					user[0].coin,
				)
			: null;
	}

	async findByEmail(email: string) {
		const user = await db
			.select({
				email: users.email,
				username: users.username,
				password: users.password,
				name: users.name,
				coin: users.coin,
				github_id: users.github_id,
				profile_picture: users.profile_picture,
			})
			.from(users)
			.where(eq(users.email, email));
		return user[0]
			? new User(
					undefined,
					user[0]?.name,
					user[0]?.email,
					user[0]?.username,
					user[0]?.profile_picture,
					user[0]?.github_id,
					user[0].password,
					undefined,
					user[0].coin,
				)
			: null;
	}

	async findById(id: string) {
		const user = await db.select().from(users).where(eq(users.id, id));
		return user[0]
			? new User(
					user[0].id,
					user[0].name,
					user[0].email,
					user[0].username,
					user[0].profile_picture,
					user[0].github_id,
					user[0].password,
					user[0].accessToken,
					user[0].coin,
				)
			: null;
	}

	async delete(email: string) {
		try {
			await db.delete(users).where(eq(users.email, email));
		} catch (error) {
			return error;
		}
	}

	async update(name: string, email?: string, oldEmail?: string) {
		try {
			await db
				.update(users)
				.set({
					name,
					email,
				})
				.where(eq(users.email, oldEmail as string));
		} catch (error) {
			return error;
		}
	}

	async updatePassword(new_password: string, username: string) {
		const password = new_password;

		try {
			await db
				.update(users)
				.set({
					password,
				})
				.where(eq(users.username, username));
		} catch (error) {
			return error;
		}
	}
}
