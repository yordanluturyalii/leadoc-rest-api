import { Inject, Service } from "typedi";
import type { UserRepository } from "../repositories/user.repository";
import { logger } from "../utils/logger.utils";
import bcrypt from "bcryptjs";
import { config } from "../config/config";
import jwt from 'jsonwebtoken';
import { Octokit } from "octokit";
import redisClient from "../config/redis.config";

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

    async checkStatus(id: string){
      const connect = await this.userRepository.findByGithubId(id)
      if(connect.github_id == undefined) return {
        user:{
          "connection_status": "DISCONNECTED",
          "username": "",
          "profile_picture":  "",
          "profile_url": ""
        }
      }
      
      const existingUsernameInRedis = await redisClient.get(`username:${connect?.username}`)

      if(!existingUsernameInRedis){
        const octokit  = new Octokit({
          auth: connect?.accessToken
        })
        
        const {data} = await octokit.rest.users.getByUsername({
          username: connect?.username
        })

        const result = {
          "connection_status": "CONNECTED",
          "username": connect.username,
          "profile_picture": connect.profile_picture,
          "profile_url": data.avatar_url
        }

        await redisClient.setEx(`username:${connect?.username}`, 60 * 10, JSON.stringify(result))

        return {
          user: result
        }
      } else {
        const dataFromRedis = await redisClient.get(`username:${connect?.username}`)

        return {
          user: JSON.parse(dataFromRedis)
        }
      }

    }
}