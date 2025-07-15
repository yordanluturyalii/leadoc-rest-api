import { Inject, Service } from "typedi";
import type { RepositoryServices } from "../services/repository.services";

@Service()
export class RepositoryController {
  constructor(@Inject() private repoService: RepositoryServices) {}
}
