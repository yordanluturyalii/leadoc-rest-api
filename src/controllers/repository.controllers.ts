import { Inject, Service } from "typedi";
import type { RepositoryServices } from "../services/repository.services";
import type { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/response.utils";
import { logger } from "../utils/logger.utils";

@Service()
export class RepositoryController {
  constructor(@Inject("RepositoryService") private repoService: RepositoryServices) {}

  async getRepo(req: Request, res: Response) {
    try {
      const user = req.user;

      const accessToken = await this.repoService.getAccessToken(user?.email, user?.id);      
      logger.info(accessToken);

      if (!accessToken) errorResponse(res, "Mising Access Token", {}, 401);

      if (!user?.id) errorResponse(res, "Github Connection Required", {}, 400);

      const repositories = await this.repoService.getRepo(accessToken, user?.id);

      logger.info("Data Repository: %o", repositories);
      successResponse(res, "Success Get Repository", repositories); 
    } catch (error) {

    }
  }

  async generateReadme(req: Request, res: Response) {
    try {
      // const user = req.user;
      const { name } = req.params;

      // const accessToken = await this.repoService.getAccessToken(user?.email, user?.id);      
      // logger.info(accessToken);

      // if (!accessToken) errorResponse(res, "Mising Access Token", {}, 401);
      
      const repository = await this.repoService.generateReadme("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", name, "152061596");
      successResponse(res, "Succes Generate Readme", repository);
    } catch (error) {
      errorResponse(res, "Internal Server Error", error);
    }
  }
}
