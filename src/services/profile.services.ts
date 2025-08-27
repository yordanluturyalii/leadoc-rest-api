import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Octokit } from "octokit";
import { Inject, Service } from "typedi";
import { config } from "../config/config";
import redisClient from "../config/redis.config";
import type { UserRepository } from "../repositories/user.repository";
import { logger } from "../utils/logger.utils";

@Service()
export class ProfileServices {
	constructor(
		@Inject("UserRepository") public userRepository: UserRepository,
	) {}

	async getMe(email: string, username?: string) {
		try {
			let user = await this.userRepository.findByEmail(email);
			if (!user) {
				user = await this.userRepository.findByUsername(username as string);
			}

			return {
				user: {
					name: user?.name,
					email: user?.email,
					coin: user?.coin,
				},
			};
		} catch (error) {
			logger.error("Error: %o", error);
			return error;
		}
	}

	async delete(email: string, password: string) {
		const exist = await this.userRepository.findByEmail(email);
		if (!exist) return false;

		const isMatch = await bcrypt.compare(password, exist?.password as string);
		if (!isMatch) throw new Error("password Incorect");

		await this.userRepository.delete(email);
	}

	async update(
		name: string,
		email: string,
		cookie: {
			name: string;
			email: string;
			username: string;
			password: string;
			exp: number;
		},
	) {
		const exist = await this.userRepository.findByEmail(cookie?.email);
		if (!exist) return false;

		try {
			const newCookeiExp = cookie.exp - Math.floor(Date.now() / 1000);
			await this.userRepository.update(name, email, cookie.email);

			const token = jwt.sign(
				{
					name: cookie.name,
					username: cookie.username,
					email: email,
					password: cookie.password,
				},
				config.jwtSecret,
				{ expiresIn: newCookeiExp },
			);

			return token;
		} catch (error) {
			logger.error("Error: %o", error);
			return error;
		}
	}

	async updatePassword(
		new_password: string,
		password: string,
		cookie: {
			id: string;
			name: string;
			email: string;
			username: string;
			password: string;
			exp: number;
		},
	) {
		let githubExists: any;
		if (!cookie.id)
			githubExists = await this.userRepository.findByEmail(cookie.email);
		if (cookie.id)
			githubExists = await this.userRepository.findByGithubId(cookie.id);

		if (githubExists?.password) {
			const passwordLowercase = password.toLowerCase();
			const isMatch = await bcrypt.compare(
				passwordLowercase,
				githubExists?.password,
			);
			if (!password || password.length < 1) return "Password is required";
			if (!isMatch) return "Password Incorrect";
		}

		const newPaswwordLowerCase = new_password.toLowerCase();
		const hashPassword = await bcrypt.hash(newPaswwordLowerCase, 10);
		await this.userRepository.updatePassword(hashPassword, cookie.username);

		return null;
	}

	async checkStatus(id: string) {
		const connect = await this.userRepository.findByGithubId(id);
		if (!connect) return { message: "User Not Found" };

		if (connect.github_id === undefined)
			return {
				user: {
					connection_status: "DISCONNECTED",
					username: "",
					profile_picture: "",
					profile_url: "",
				},
			};

		const existingUsernameInRedis = await redisClient.get(
			`github:${connect?.github_id}`,
		);

		if (!existingUsernameInRedis) {
			const octokit = new Octokit({
				auth: connect?.accessToken,
			});

			const { data } = await octokit.rest.users.getByUsername({
				username: connect?.username as string,
			});

			const result = {
				connection_status: "CONNECTED",
				username: connect.username,
				profile_picture: connect.profile_picture,
				profile_url: data.avatar_url,
			};

			await redisClient.setEx(
				`github:${connect?.github_id}`,
				60 * 10,
				JSON.stringify(result),
			);

			return {
				user: result,
			};
		} else {
			const dataFromRedis = await redisClient.get(
				`github:${connect?.github_id}`,
			);

			return {
				user: JSON.parse(dataFromRedis as string),
			};
		}
	}
}
