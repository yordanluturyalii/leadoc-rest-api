import { Inject, Service } from "typedi";
import type { ProfileRepository } from "../repositories/profile.repository";
import { logger } from "../utils/logger.utils";

@Service()
export class ProfileServices {
  constructor(
    @Inject("ProfileRepository") public profileRepository: ProfileRepository,
  ) {}

    async getMe(email: string){
      try{
        const user = await this.profileRepository.findByEmail(email)
  
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
}