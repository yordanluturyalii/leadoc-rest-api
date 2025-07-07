import { Inject, Service } from "typedi";
import type { UserRepository } from "../repositories/user.repository";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { logger } from "../utils/logger.utils";
import bcrypt from "bcrypt";

@Service()
export class AuthServices {
  constructor(
    @Inject("UserRepository") public userRepository: UserRepository,
  ) {}
  async authorize(
    githubId: string,
    accessToken: string,
    name: string,
    email?: string,
    profile_picture?: string,
    username?: string,
  ) {
    try {
      const user = await this.userRepository.findByGithubId(githubId);
      if (user === null)
        await this.userRepository.create(
          name,
          email,
          username,
          githubId,
          profile_picture,
          undefined,
          accessToken,
        );
    } catch (error) {
      logger.error("Error: %o", error);
      return error;
    }
  }

  async register(name: string, email: string, password: string, passwordConfirmation: string) {
    try {
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) throw new Error("Email already taken");
      if (password !== passwordConfirmation) throw new Error("The password confirmation does not match.");

      const hashPassword = await bcrypt.hash(password, 10);

      const token = jwt.sign(
        {
          name, email, hashPassword
        },
        config.jwtSecret,
        { expiresIn: "7d" },
      );

      const user = await this.userRepository.create(name, email, undefined, undefined, undefined, hashPassword, undefined);
      return {
        user: {
          name, email
        },
        token
      }
    } catch (error) {
      logger.error("Error: %o", error);
      return error;
    }
  }
}
