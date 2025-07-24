import { Inject, Service } from "typedi";
import type { UserRepository } from "../repositories/user.repository";
import { Octokit } from "octokit";
import { logger } from "../utils/logger.utils";
import redisClient from "../config/redis.config";
import { RepoRepository } from "../repositories/repo.repository";
import { Repository } from "../db/models/repositories.model";
import pLimit from "p-limit";
import { importantFiles } from "../utils/constant.util";
import { Base64 } from "js-base64";

@Service()
export class RepositoryServices {
  constructor(@Inject("UserRepository") private userRepository: UserRepository, @Inject("RepoRepository") private repoRepository: RepoRepository) { }

  async getAccessToken(email?: string, githubId?: string) {
    try {
      let token;

      const user = await this.userRepository.findByEmail(email);
      if (user) {
        token = user?.accessToken;
      } else {
        const githubUser = await this.userRepository.findByGithubId(githubId);
        token = githubUser?.accessToken;
      }

      return token;
    } catch (error) {
      return error;
    }
  }


  async getRepo(accessToken: string, githubId: string) {
    try {
      const cacheRepositories = await redisClient.get(`repositories:${githubId}`);
      logger.info("Cache: %o", cacheRepositories);

      if (cacheRepositories) {
        return JSON.parse(cacheRepositories);
      }

      const user = await this.userRepository.findByGithubId(githubId);

      const existingRepo = await this.repoRepository.getByUserId(user?.id);
      const existingRepoNames = new Set(existingRepo.map(repo => repo.name));

      if (existingRepo.length > 0) {
        await redisClient.setEx(`repositories:${githubId}`, 60 * 10, JSON.stringify(existingRepo));
        return existingRepo;
      }

      const octokit = new Octokit({
        auth: accessToken
      });

      const { data: repositories } = await octokit.rest.repos.listForAuthenticatedUser({
        per_page: 100
      });

      const ownRepositories = repositories.filter(repo => repo.owner.login === user?.username);
      const updatedRepositories = ownRepositories.filter(repo => !existingRepoNames.has(repo.full_name));

      const limit = pLimit(5);

      const userRepositories = await Promise.all(
        updatedRepositories.map((item, index) => limit(async () => {
          let haveReadme = false;
          try {
            await octokit.rest.repos.getReadme({
              owner: item.owner.login,
              repo: item.name
            });
            haveReadme = true
          } catch (error) {
            logger.error("Error: %o", error?.message);
          }

          return new Repository((index + 1).toString(), item.name, item.private, user?.id, haveReadme, null, null);
        })));

      await this.repoRepository.saveMany(userRepositories);

      const newestRepositories = [...existingRepo, ...userRepositories];

      await redisClient.setEx(`repositories:${githubId}`, 60 * 10, JSON.stringify(userRepositories));

      return newestRepositories;
    } catch (error) {
      logger.info("Error On Get Repository: %o", error);
      throw error;
    }
  }

  async generateReadme(accessToken: string, name: string, githubId: string) {
    const octokit = new Octokit({
      auth: accessToken
    });

    const user = await this.userRepository.findByGithubId(githubId);

    const repoInfo = await octokit.rest.repos.get({
      owner: user?.username || "",
      repo: name
    });
    const defaultBranch = repoInfo.data.default_branch;

    const repoRootContent = await octokit.rest.repos.getContent({
      owner: user?.username || '',
      repo: name,
      path: "",
      ref: defaultBranch
    });

    if (!Array.isArray(repoRootContent.data)) throw new Error("This repo is empty");

    const metadata: Record<string, any> = {};
    const structure: string[] = [];

    for (const item of repoRootContent.data) {
      const name = item.name.toLowerCase();
      const isImportant = importantFiles.map(f => f.toLowerCase()).includes(name.toLowerCase());

      if (item.type === "dir") {
        structure.push(item.name);
      }

      if (!isImportant && item.type !== "file") continue;

      try {
        logger.info(item.path);
        const fileContent = await octokit.rest.repos.getContent({
          owner: user?.username || "",
          repo: name,
          path: item.path,
          ref: defaultBranch
        });

        const content = Base64.decode((fileContent.data as any).content || "");
        metadata[item.name] = content;

      } catch (err) {
        logger.warn(`⚠️ Failed to get content for ${item.name}: ${err?.message}`);
      }
    }

    return {
      username: user?.username,
      name,
      // language: this.detectLanguage(Object.keys(metadata)),
      structure,
      metadata,
    };
    // return content;
  }
}
