import { Octokit } from "octokit";
import pLimit from "p-limit";
import { Inject, Service } from "typedi";
import redisClient from "../config/redis.config";
import { Repository } from "../db/models/repositories.model";
import type { RepoRepository } from "../repositories/repo.repository";
import type { UserRepository } from "../repositories/user.repository";
import { logger } from "../utils/logger.utils";

@Service()
export class RepositoryServices {
	constructor(
		@Inject("UserRepository") private userRepository: UserRepository,
		@Inject("RepoRepository") private repoRepository: RepoRepository,
	) {}

	async getAccessToken(
		email: string,
		githubId: string,
	): Promise<string | undefined | unknown> {
		try {
			let token: string;

			const user = await this.userRepository.findByEmail(email);
			if (user) {
				token = user?.accessToken as string;
			} else {
				const githubUser = await this.userRepository.findByGithubId(githubId);
				token = githubUser?.accessToken as string;
			}

			return token;
		} catch (error) {
			return error;
		}
	}

	async getRepo(accessToken: string, githubId: string) {
		try {
			const cacheRepositories = await redisClient.get(
				`repositories:${githubId}`,
			);

			if (cacheRepositories) {
				return JSON.parse(cacheRepositories);
			}

			const user = await this.userRepository.findByGithubId(githubId);
			const userId = user?.id || "";

			const existingRepo = await this.repoRepository.getByUserId(userId);
			const existingRepoNames = new Set(existingRepo.map((repo) => repo.name));

			if (existingRepo.length > 0) {
				await redisClient.setEx(
					`repositories:${githubId}`,
					60 * 10,
					JSON.stringify(existingRepo),
				);
				return existingRepo;
			}

			const octokit = new Octokit({
				auth: accessToken,
			});

			const { data: repositories } =
				await octokit.rest.repos.listForAuthenticatedUser({
					per_page: 100,
				});

			const ownRepositories = repositories.filter(
				(repo) => repo.owner.login === user?.username,
			);
			const updatedRepositories = ownRepositories.filter(
				(repo) => !existingRepoNames.has(repo.full_name),
			);

			const limit = pLimit(5);

			const userRepositories = await Promise.all(
				updatedRepositories.map((item, index) =>
					limit(async () => {
						let haveReadme = false;
						try {
							await octokit.rest.repos.getReadme({
								owner: item.owner.login,
								repo: item.name,
							});
							haveReadme = true;
						} catch (error) {
							logger.error("Error: %o", error);
						}

						return new Repository(
							(index + 1).toString(),
							item.name,
							item.private ? "PRIVATE" : "PUBLIC",
							userId,
							haveReadme,
							null,
							null,
						);
					}),
				),
			);

			await this.repoRepository.saveMany(userRepositories);

			const newestRepositories = [...existingRepo, ...userRepositories];

			await redisClient.setEx(
				`repositories:${githubId}`,
				60 * 10,
				JSON.stringify(userRepositories),
			);

			return newestRepositories;
		} catch (error) {
			logger.info("Error On Get Repository: %o", error);
			throw error;
		}
	}
}
