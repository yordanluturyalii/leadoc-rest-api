import { Inject, Service } from "typedi";
import type { UserRepository } from "../repositories/user.repository";
import { logger } from "../utils/logger.utils";
import bcrypt from "bcryptjs";
import { config } from "../config/config";
import jwt from 'jsonwebtoken';

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
            email:user?.email,
            coin: user?.coin
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

    async update(name: string, email:string, cookie:object){
      const exist =  await this.userRepository.findByEmail(cookie.email)
      if (!exist) return (false);

      try{
        const newCookeiExp = cookie.exp - (Math.floor(Date.now() / 1000));
        await this.userRepository.update(name, email, cookie.email)
        
        const token = jwt.sign(
          {
            name: cookie.name,
            username: cookie.username,
            email: email,
            password: cookie.password
          },
          config.jwtSecret,
          { expiresIn: newCookeiExp},
        );

        return token

      }catch(error){
        logger.error("Error: %o", error);
        return error;
      }
    }

    async updatePassword(new_password: string, password:string, cookie:object){
      let githubExists
      if(!cookie.id) githubExists = await this.userRepository.findByEmail(cookie.email)
      if(cookie.id) githubExists = await this.userRepository.findByGithubId(cookie.id)
      
      if(githubExists?.password){
        const passwordLowercase = password.toLowerCase()
        const isMatch = await bcrypt.compare(passwordLowercase, githubExists?.password)
        if(!password || password.length < 1) return("Password is required")
        if (!isMatch) return("Password Incorrect");
      }

      const newPaswwordLowerCase = new_password.toLowerCase()
      const hashPassword = await bcrypt.hash(newPaswwordLowerCase, 10);
      await this.userRepository.updatePassword(hashPassword, cookie.username)

      return null
    }
}