import { Service } from "typedi";
import { db } from "../db/db";
import { users } from "../db/schema";
import { User } from "../db/models/user.model";

@Service()
export class ProfileRepository {
      async findByEmail(email: string) {
        const user = await db.select({email: users.email, username:users.username, password:users.password, name:users.name}).from(users).where(eq(users.email, email));
        return user[0] 
          ? new User(
            undefined,
            user[0]?.name, 
            user[0]?.email,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined
          ) : null
      }
}