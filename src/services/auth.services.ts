import { Inject, Service } from "typedi";
import type { UserRepository } from "../repositories/user.repository";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { logger } from "../utils/logger.utils";
import { log } from "winston";
import bcrypt from "bcrypt";
import { response } from "express";


@Service()
export class AuthServices {
  constructor(
    @Inject("UserRepository") public userRepository: UserRepository,
  ) {}
  async authorize(
    githubId: string,
    username: string,
    accessToken: string,
    name: string,
    profile_picture: string,
  ) {
    try {
      const user = await this.userRepository.findByGithubId(githubId);
      if (user === null)
        await this.userRepository.create(
          name,
          username,
          githubId,
          profile_picture,
          undefined,
          accessToken,
        );
      const token = jwt.sign(
        {
          githubId,
          username,
          accessToken,
        },
        config.jwtSecret,
        { expiresIn: "7d" },
      );

      return token;
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

  async login(email: string,password: string, res:Response) {
    try{
      const existingEmail = await this.userRepository.findByEmail(email)
      if (!existingEmail) throw new Error("This email must be in the correct format and linked to an existing user.");

      const isMatch = await bcrypt.compare(password, existingEmail.password)
      if (!isMatch) throw new Error("Password Incorrect");
      
      const token = jwt.sign(
        {
          name: existingEmail.name,
          username: existingEmail.username,
          email: existingEmail.email,
          password: existingEmail.password
        },
        config.jwtSecret,
        { expiresIn: "7d" },
      );
      
      res.cookie("token", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      
      return {
        user:{
          username: existingEmail.username,
          email: existingEmail.email
        },
        token: token
      }


    }catch(error){
      logger.error("Error: %o", error);
      return error;
    }
  }
}
