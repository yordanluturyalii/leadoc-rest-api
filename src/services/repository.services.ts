import { Inject, Service } from "typedi";
import type { UserRepository } from "../repositories/user.repository";

@Service()
export class RepositoryServices {
  constructor(@Inject("UserRepository") private userRepository: UserRepository){}

  async getAccessToken(userId?: string, githubId?: string) {
    try {
      let token;

      const user = await this.userRepository.findById(userId);
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
}
