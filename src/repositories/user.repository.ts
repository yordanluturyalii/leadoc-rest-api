import { Service } from "typedi";
import { db } from "../db/db";
import { users } from "../db/schema";
import { eq, or } from "drizzle-orm";
import { User } from "../db/models/user.model";
import type { NodePgDatabase, NodePgTransaction } from "drizzle-orm/node-postgres";

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
        user[0].accessToken,
        user[0].coin

      )
      : null;
  }

  async findByEmail(email: string) {
    const user = await db.select({ email: users.email, username: users.username, password: users.password, name: users.name, coin: users.coin }).from(users).where(eq(users.email, email));
    return user[0]
      ? new User(
        undefined,
        user[0]?.name,
        user[0]?.email,
        user[0]?.username,
        undefined,
        undefined,
        user[0].password,
        undefined,
        user[0].coin
      ) : null
  }


  async findById(id: string) {
    const user = await db.select().from(users).where(eq(users.id, id));
    return user[0] ?
      new User(
        user[0].id,
        user[0].name,
        user[0].email,
        user[0].username,
        user[0].profile_picture,
        user[0].github_id,
        user[0].password,
        user[0].accessToken,
        user[0].coin

      ) : null
  }

  async delete(email: string) {
    try {
      await db.delete(users).where(eq(users.email, email));
    } catch (error) {
      throw error?.message;
    }
  }

  async updatePassword(new_password: string, username: string, email: string) {
    const password = new_password

    try {
      await db.update(users).set({
        password,
      }).where(or(
        eq(users.username, username),
        eq(users.email, email)));
    } catch (error) {
      throw error?.message;
    }
  }
}
