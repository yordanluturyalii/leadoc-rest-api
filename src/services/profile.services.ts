import { Inject, Service } from "typedi";
import type { UserRepository } from "../repositories/user.repository";
import { logger } from "../utils/logger.utils";
import bcrypt from "bcryptjs";

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

    async delete(email: string, password:string){
      const exist =  await this.userRepository.findByEmail(email)
      if (!exist) return (false);

      const isMatch = await bcrypt.compare(password, exist?.password)
      if(!isMatch) throw new Error("password Incorect")

      await this.userRepository.delete(email)
    }
}