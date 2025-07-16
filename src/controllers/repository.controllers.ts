import { Inject, Service } from "typedi";
import type { RepositoryServices } from "../services/repository.services";
import type { Request, Response } from "express";
import { successResponse } from "../utils/response.utils";

@Service()
export class RepositoryController {
  constructor(@Inject("RepositoryService") private repoService: RepositoryServices) {}

  getRepo(req: Request, res: Response) {
    successResponse(res, "Coba", {}); 
  }
}
