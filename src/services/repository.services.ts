import { Inject, Service } from "typedi";
import type { UserRepository } from "../repositories/user.repository";
import { Octokit } from "octokit";
import { logger } from "../utils/logger.utils";
import redisClient from "../config/redis.config";
import { RepoRepository } from "../repositories/repo.repository";

@Service()
export class RepositoryServices {
  constructor(@Inject("UserRepository") private userRepository: UserRepository, @Inject("RepoRepository") private repoRepository: RepoRepository){}

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

      const octokit = new Octokit({
        auth: accessToken
      });

      const {data: repositories} = await octokit.rest.repos.listForAuthenticatedUser({
        per_page: 100
      }); 

      const user = await this.userRepository.findByGithubId(githubId);

      const ownRepositories = repositories.filter(repo => repo.owner.login === user?.username);

      const userRepositories = await Promise.all( 
        ownRepositories.map(async(item, index)=> {
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

          return {
            id: index + 1,
            name: item.full_name,
            isPrivate: item.private,
            haveReadme
          }
        }));

      await this.repoRepository.saveMany(userRepositories);

      await redisClient.setEx(`repositories:${githubId}`, 60 * 60, JSON.stringify(userRepositories));

      return userRepositories;
    } catch (error) {
      logger.info("Error On Get Repository: %o", error);
      throw error;
    }   
  }
}
