import { Inject, Service } from "typedi";
import type { UserRepository } from "../repositories/user.repository";

@Service()
export class RepositoryServices {
  constructor(@Inject() private userRepository: UserRepository){}

  
}
