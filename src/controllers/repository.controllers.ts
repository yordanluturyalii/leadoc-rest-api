import type { Request, Response } from "express";
import { Inject, Service } from "typedi";
import type { RepositoryServices } from "../services/repository.services";
import { logger } from "../utils/logger.utils";
import { errorResponse, successResponse } from "../utils/response.utils";

@Service()
export class RepositoryController {
	constructor(
		@Inject("RepositoryService") private repoService: RepositoryServices,
	) {}

	async getRepo(req: Request, res: Response) {
		try {
			const user = req.user as any;

			const accessToken = await this.repoService.getAccessToken(
				user?.email,
				user?.id,
			);

			if (typeof accessToken as unknown)
				errorResponse(res, "Mising Access Token", {}, 401);

			if (!user?.id) errorResponse(res, "Github Connection Required", {}, 400);

			const repositories = await this.repoService.getRepo(
				accessToken as string,
				user?.id,
			);

			logger.info("Data Repository: %o", repositories);
			successResponse(res, "Success Get Repository", repositories);
		} catch (_error) {
			errorResponse(res, "Internal Server Error", {}, 500);
		}
	}

	async generateReadme(req: Request, res: Response) {
		try {
			// const user = req.user;
			const { name } = req.params;

			// const accessToken = await this.repoService.getAccessToken(user?.email, user?.id);
			// logger.info(accessToken);

			// if (!accessToken) errorResponse(res, "Mising Access Token", {}, 401);

			const repository = await this.repoService.generateReadme(
				"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",
				name as string,
				"152061596",
			);
			successResponse(res, "Succes Generate Readme", repository);
		} catch (error) {
			errorResponse(res, "Internal Server Error", error);
		}
	}
}
