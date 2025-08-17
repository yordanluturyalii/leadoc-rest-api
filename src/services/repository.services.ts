import { PromptTemplate } from "@langchain/core/prompts";
import { Octokit } from "octokit";
import pLimit from "p-limit";
import { Inject, Service } from "typedi";
import redisClient from "../config/redis.config";
import { Repository } from "../db/models/repositories.model";
import type { RepoRepository } from "../repositories/repo.repository";
import type { UserRepository } from "../repositories/user.repository";
import { logger } from "../utils/logger.utils";
import { ReadmeServices } from "./readme.services";
import type { AIServices } from "./ai.services";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { config } from "../config/config";
import type { DetailRepoRepositories } from "../repositories/detail-repo.repository";

@Service()
export class RepositoryServices {
	constructor(
		@Inject("UserRepository") private userRepository: UserRepository,
		@Inject("RepoRepository") private repoRepository: RepoRepository,
		@Inject("AIServices") private aiServices: AIServices,
		@Inject("DetailRepoRepository") private detailRepoRepository: DetailRepoRepositories
	) {
	}

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
				(repo: any) => repo.owner.login === user?.username,
			);
			const updatedRepositories = ownRepositories.filter(
				(repo: any) => !existingRepoNames.has(repo.full_name),
			);

			const limit = pLimit(5);

			const userRepositories = await Promise.all(
				updatedRepositories.map((item: any, index: any) =>
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

	async generateReadme(section: string[], repo: string, githubId: string) {
		try {
			const user = await this.userRepository.findByGithubId(githubId);
			if (!user) throw new Error("Unauthorized");
			const githubUsername = user?.username as string;

			if (user?.coin as number <= 0) throw new Error("Not enough coin");

			const currentCoin = user?.coin as number - section.length;
			await this.userRepository.updateCoin(currentCoin, user.username as string);

			const readmeServices = new ReadmeServices(user?.accessToken as string);
			const analyzeProject = await readmeServices.analyzeRepository(githubUsername, repo);

			const prompt = this.aiServices.generateSection(section, analyzeProject, true);

			const llm = new ChatGoogleGenerativeAI({
				model: "gemma-3n-e2b-it",
				temperature: 0,
				apiKey: config.aiApiKey
			});

			const promptTemplate = PromptTemplate.fromTemplate(`
				Anda adalah seorang expert technical writer khusus README.md untuk proyek software.

				Tugas Anda:
				1. Analisis input proyek yang diberikan.
				2. Hasilkan konten README.md sesuai instruksi section yang diberikan.
				3. Jangan menambahkan teks lain.
				4. Gunakan Bahasa yang professional serta buat text panjang

				INPUT:
				{prompt}

				OUTPUT:
				README.md section, tanpa tambahan teks atau penjelasan lain.
			`);

			const chain = promptTemplate.pipe(llm);

			const result = await chain.invoke({ prompt: prompt });

			const cleanResult = result.content.toString().replace(/\\n/g, '\n');

			const updatedRepo = await this.repoRepository.updateByName(repo, {updated_at: new Date()});
			logger.info("From Repository Service - Updated Repo: %o", updatedRepo?.id);

			await this.detailRepoRepository.save(updatedRepo?.id as string, cleanResult);

			return cleanResult;
		} catch (error) {
			return error;
		}
	}
}
