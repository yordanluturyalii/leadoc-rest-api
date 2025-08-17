import { desc, eq } from "drizzle-orm";
import { db } from "../db/db";
import { detailRepositories } from "../db/schema";

export class DetailRepoRepositories {
    async save(repoId: string, content: string) {
        try {
            const last = await db
                .select({ version: detailRepositories.version })
                .from(detailRepositories)
                .where(eq(detailRepositories.repository_id, repoId))
                .orderBy(desc(detailRepositories.version))
                .limit(1);

            const nextVersion = (last[0]?.version ?? 0) + 1;

            await db.insert(detailRepositories).values({
                version: nextVersion,
                content: content,
                repository_id: repoId
            });
        } catch (error) {
            return error;
        }
    }
}