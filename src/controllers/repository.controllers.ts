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

			successResponse(res, "Success Get Repository", repositories);
		} catch (_error) {
			errorResponse(res, "Internal Server Error", {}, 500);
		}
	}
}
