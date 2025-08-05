import { type Request, type Response, Router } from "express";
import Container from "typedi";
import { RepositoryController } from "../controllers/repository.controllers";
import authMiddleware from "../middlewares/auth.middlewares";
import setupDI from "../utils/di.utils";

setupDI();
const repoRoutes = Router();
const repoController = Container.get(RepositoryController);

repoRoutes.use(authMiddleware);

repoRoutes.get("/user/repositories", (req: Request, res: Response) => {
	repoController.getRepo(req, res);
});

export default repoRoutes;
