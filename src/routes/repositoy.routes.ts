import { type Request, type Response, Router } from "express";
import Container from "typedi";
import { RepositoryController } from "../controllers/repository.controllers";
import authMiddleware from "../middlewares/auth.middlewares";
import setupDI from "../utils/di.utils";

setupDI();
const repoRoutes = Router();
const repoController = Container.get(RepositoryController);

repoRoutes.use(authMiddleware);

repoRoutes.post("/user/repositories/:name", (req: Request, res: Response) => {
	repoController.generateReadme(req, res);
});

repoRoutes.get("/user/repositories", (req: Request, res: Response) => {
	repoController.getRepo(req, res);
});

repoRoutes.post("/user/repositories/:name/push", (req: Request, res: Response) => {
	repoController.pushReadme(req, res);
});

export default repoRoutes;
