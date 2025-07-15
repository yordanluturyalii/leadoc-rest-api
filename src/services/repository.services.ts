import { Inject, Service } from "typedi";
import type { UserRepository } from "../repositories/user.repository";

@Service()
export class RepositoryServices {
  constructor(@Inject() private userRepository: UserRepository){}

  async getAccessToken(userId: string) {
    try {
      const user = await this.userRepository.findById(userId);
      return user?.accessToken;
    } catch (error) {
      return error;
    }
  }  
}
