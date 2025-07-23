import Container from "typedi";
import setupDI from "../utils/di.utils";
import { Router, type Request, type Response } from "express";
import { RepositoryController } from "../controllers/repository.controllers";
import authMiddleware from "../middlewares/auth.middlewares";

setupDI();
const repoRoutes = Router();
const repoController = Container.get(RepositoryController);

repoRoutes.use(authMiddleware);

repoRoutes.get("/user/repositories", (req: Request, res: Response) => {
  repoController.getRepo(req, res);
}); 

repoRoutes.post("/user/repositories/:name", (req: Request, res: Response) => {
  
})

export default repoRoutes;
