import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { Repository } from "../db/models/repositories.model";
import { repositories } from "../db/schema";

export class RepoRepository {
	async save(
		name: string,
		visibility: "PRIVATE" | "PUBLIC",
		userId: string,
		isHaveReadme: boolean,
		createdAt: Date,
		updatedAt: Date | null,
	) {
		const repo = await db
			.insert(repositories)
			.values({
				name,
				visibility,
				user_id: userId,
				is_have_readme: isHaveReadme,
				created_at: createdAt,
				updated_at: updatedAt,
			})
			.returning();
		return repo[0]
			? new Repository(
				repo[0].id,
				repo[0].name,
				repo[0].visibility,
				repo[0].user_id,
				repo[0].is_have_readme,
				repo[0].created_at,
				repo[0].updated_at,
			)
			: null;
	}

	async saveMany(entities: Repository[]) {
		const values = entities.map((repo) => ({
			name: repo.name,
			visibility: repo.visibility as "PRIVATE" | "PUBLIC",
			user_id: repo.userId as string,
			is_have_readme: repo.haveReadme,
			created_at: new Date(),
			updated_at: new Date(),
		}));

		await db.insert(repositories).values(values).onConflictDoNothing();
	}

	async getByUserId(id: string) {
		return await db
			.select()
			.from(repositories)
			.where(eq(repositories.user_id, id));
	}

	async updateByName(name: string, data: Partial<typeof repositories.$inferInsert>) {
		const repo = await db.update(repositories).set(data).where(eq(repositories.name, name)).returning({ id: repositories.id });
		return repo[0];
	}

	async findByName(name: string) {
		try {
			return await db.select().from(repositories).where(eq(repositories.name, name));
		} catch (error) {
			return error;
		}
	}
}
