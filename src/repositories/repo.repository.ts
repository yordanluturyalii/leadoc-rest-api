import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { Repository } from "../db/models/repositories.model";
import { repositories } from "../db/schema";

export class RepoRepository {
  async save(name: string, visibility: "PRIVATE" | "PUBLIC", userId: string, createdAt: Date, updatedAt: Date | null) {
    const repo = await db.insert(repositories).values({
      name, visibility, user_id: userId, created_at: createdAt, updated_at: updatedAt
    }).returning();
    return repo[0] ? new Repository(
      repo[0].id,
      repo[0].name,
      repo[0].visibility,
      repo[0].user_id,
      repo[0].haveReadme,
      repo[0].created_at,
      repo[0].updated_at
    ) : null
  }

  async saveMany(entities: Repository[]) {
    const values = entities.map(repo => ({
      name: repo.name,
      visibility: repo.visibility ? "PRIVATE" : "PUBLIC", 
      user_id: repo.userId,
      haveReadme: repo.haveReadme,
    }));

    await db.insert(repositories).values(values).onConflictDoNothing(); 
  }

  async getByUserId(id: string) {
    return await db.select().from(repositories).where(eq(repositories.user_id, id);
  }
}
