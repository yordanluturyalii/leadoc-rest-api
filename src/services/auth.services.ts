import { Inject, Service } from "typedi";
import type { UserRepository } from "../repositories/user.repository";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { logger } from "../utils/logger.utils";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { db } from "../db/db";
import redisClient from "../config/redis.config";

@Service()
export class AuthServices {
  constructor(
    @Inject("UserRepository") public userRepository: UserRepository,
  ) { }
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
      return error;
    }
  }

  async register(name: string, email: string, password: string, passwordConfirmation: string) {
    try {
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) throw new Error("Email already taken");
      if (password !== passwordConfirmation) throw new Error("The password confirmation does not match.");
      
      const passwordLowerCase = password.toLowerCase()
      const hashPassword = await bcrypt.hash(passwordLowerCase, 10);
      const token = jwt.sign(
        {
          name, email, hashPassword
        },
        config.jwtSecret,
        { expiresIn: "7d" },
      );
      const user = await this.userRepository.create(name, email, undefined, undefined, undefined, hashPassword, undefined);
      console.log(user)
      return {
        user: {
          name, email
        },
        token
      }
    } catch (error) {
      logger.error("Error: %o", error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      const existingEmail = await this.userRepository.findByEmail(email)
      if (!existingEmail) throw new Error("Account not found. Please check your email and password or create a new one.");

      const passwordLowerCase = password.toLowerCase()
      const isMatch = await bcrypt.compare(passwordLowerCase, existingEmail.password)
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


      return {
        user: {
          username: existingEmail.username,
          email: existingEmail.email
        },
        token: token
      }


    } catch (error) {
      logger.error("Error: %o", error);
      throw error;
    }
  }

  async logout(email: string) {
    const exist = this.userRepository.findByEmail(email)
    if (!exist) return (false)
  }

  async sendEmail(email: string) {
    try {
      const existingEmail = await this.userRepository.findByEmail(email);
      if (!existingEmail) return {
        message: "Email not found. Please register first.",
        token: null
      };

      const token = String(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));

      await redisClient.setEx(`reset-password:${email}`, 60 * 5, token);

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.emailUser,
          pass: config.emailPassword,
        }
      })
      const mailOptions = {
        from: config.emailUser,
        to: email,
        subject: 'Reset Password',
        text: `Click the link to reset your password: ${config.frontendUrl}/reset-password?token=${token}`,
      };

      await transporter.sendMail(mailOptions);
      logger.info("Email sent successfully to %s", email);

      return {
        message: "Verification email sent successfully.",
        token
      };
    } catch (error) {
      logger.error("Error: %o", error);
      throw error;
    }
  }

  async resetPassword(email: string, newPassword: string, token: string) {
    try {
      const redisToken = await redisClient.get(`reset-password:${email}`);
      if (!redisToken || redisToken !== token) {
        return { message: "Invalid or expired token." };
      }

      const hashPassword = await bcrypt.hash(newPassword, 10);
      await this.userRepository.updatePassword(hashPassword, "undefined", email);

      await redisClient.del(`reset-password:${email}`);

      return { message: "Password reset successfully." };
    } catch (error) {
      logger.error("Error: %o", error);
      throw error;
    }
  }
}
