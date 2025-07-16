import Container from "typedi";
import setupDI from "../utils/di.utils";
import { ProfileController } from "../controllers/profile.controllers";
import { Router, type Request, type Response } from "express";
import authMiddleware from "../middlewares/auth.middlewares";

setupDI();
const profileRoutes = Router();
const profileController = Container.get(ProfileController);

profileRoutes.get("/user/me", authMiddleware, (req: Request, res: Response) => profileController.getMe(req, res));

export default profileRoutes;
