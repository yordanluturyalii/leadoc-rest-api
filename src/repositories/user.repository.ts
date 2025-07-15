import { Service } from "typedi";
import { db } from "../db/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { User } from "../db/models/user.model";

@Service()
export class UserRepository {
  async create(
    name: string,
    email?: string,
    username?: string,
    github_id?: string,
    profile_picture?: string,
    password?: string,
    accessToken?: string,
  ) {
    try {
      await db.insert(users).values({
        name,
        email,
        username,
        github_id,
        profile_picture,
        password,
        accessToken,
      });
    } catch (error) {
      throw error?.message;
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
          user[0].accessToken
        )
      : null;
  }

  async findByEmail(email: string) {
    const user = await db.select({email: users.email, username:users.username, password:users.password, name:users.name}).from(users).where(eq(users.email, email));
    return user[0] 
      ? new User(
        undefined,
        user[0]?.name, 
        user[0]?.email,
        user[0]?.username,
        undefined,
        undefined,
        user[0].password,
        undefined
      ) : null
  }
}
