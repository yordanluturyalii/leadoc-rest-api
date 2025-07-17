import { Inject, Service } from "typedi";
import type { UserRepository } from "../repositories/user.repository";
import { logger } from "../utils/logger.utils";

@Service()
export class ProfileServices {
  constructor(
    @Inject("UserRepository") public userRepository: UserRepository,
  ) {}

    async getMe(email: string){
      try{
        const user = await this.userRepository.findByEmail(email)
  
        return {
          user:{
            name: user?.name,
            email:user?.email
          }
        }
      }catch(error){
        logger.error("Error: %o", error);
        return error;
      }
    } 

    async deleteAccount(email: string){
      const exist =  await this.userRepository.findByEmail(email)
      if (!exist) throw new Error("Account not found"); 
      await this.userRepository.delete(email)
    }
}