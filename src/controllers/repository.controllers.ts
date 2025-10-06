import type { Request, Response } from "express";
import { Inject, Service } from "typedi";
import type { RepositoryServices } from "../services/repository.services";
import { logger } from "../utils/logger.utils";
import { errorResponse, successResponse } from "../utils/response.utils";

@Service()
export class RepositoryController {
	constructor(
		@Inject("RepositoryService") private repoService: RepositoryServices,
	) { }

	async getRepo(req: Request, res: Response) {
		try {
			const user = req.user as any;

			const accessToken = await this.repoService.getAccessToken(
				user?.email,
				user?.id,
			);

			if (typeof accessToken !== "string")
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
			const user = req.user as any;
			if (!user) errorResponse(res, "Unauthorized", {}, 401);
			const { name } = req.params;
			const section = req.body.section;

			const repository = await this.repoService.generateReadme(
				section,
				name as string,
				user?.id as string
			);

			if (repository instanceof Error) errorResponse(res, repository.message, {
				stack: repository.stack,
				cause: repository.cause
			}, 422);

			successResponse(res, "Succes Generate Readme", {
				content: repository
			}, 201);
		} catch (error) {
			errorResponse(res, "Internal Server Error", error);
		}
	}

	async pushReadme(req: Request, res: Response) {
		try {
			const user = req.user as any;
			const { name } = req.params;
			const content = req.body.content;

			if (!user?.id) errorResponse(res, "Github Connection Required", {}, 400);

			const push = await this.repoService.pushReadme(name as string, user?.id, content);
			if (push instanceof Error) {
				logger.info("Push: %o", push);
				errorResponse(res, "Failed To Push Readme", push.message, 400)
			};

			return successResponse(res, "Success Push Readme", {}, 200);
		} catch (error) {
			errorResponse(res, "Internal Server Error", {});
		}
	}
}
