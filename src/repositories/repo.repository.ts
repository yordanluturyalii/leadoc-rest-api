import { db } from "../db/db";
import { Repository } from "../db/models/repositories.model";
import { repositories } from "../db/schema";

export class RepoRepository {
  async save(name: string, visibility: "PRIVATE" | "PUBLIC", userId: string, createdAt: Date, updatedAt: Date | null) {
    const repo = await db.insert(repositories).values({
      name, visibility, user_id: userId, created_at: createdAt, updated_at: updatedAt
    }).returning();
    return repo[0] ? Repository(
      repo[0].id,
      repo[0].name,
      repo[0].visibility,
      repo[0].user_id,
      repo[0].created_at,
      repo[0].updated_at
    ) : null
  }
}
