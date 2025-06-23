import { Inject, Service } from "typedi";
import type { UserRepository } from "../repositories/user.repository";
import jwt from "jsonwebtoken"
import { config } from "../config/config";
import { logger } from "../utils/logger.utils";

@Service()
export class AuthServices {
    constructor(@Inject("UserRepository") public userRepository: UserRepository) { }
    async authorize(githubId: string, username: string, accessToken: string, name: string, profile_picture: string) {
        try {
            const user = await this.userRepository.findByGithubId(githubId);
            if (user === null) await this.userRepository.create(name, username, githubId, profile_picture, undefined, accessToken); 
            const token = jwt.sign({
                githubId, username, accessToken
            }, config.jwtSecret, { expiresIn: "7d" });

            return token;
        } catch (error) {
            logger.error("Error: %o", error);
            return error;
        }
    }
}