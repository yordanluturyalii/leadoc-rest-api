import Container from "typedi";
import setupDI from "../utils/di.utils";
import { ProfileController } from "../controllers/profile.controllers";
import { Router, type Request, type Response } from "express";
import authMiddleware from "../middlewares/auth.middlewares";
import { profileValidator } from "../validations/profile.vallidation";
import { updateProfileValidator } from "../validations/update-profile.validation";

setupDI();
const profileRoutes = Router();
const profileController = Container.get(ProfileController);

profileRoutes.get("/user/me", authMiddleware, (req: Request, res: Response) => profileController.getMe(req, res));
profileRoutes.post("/user/delete", authMiddleware, profileValidator, (req: Request, res: Response) => profileController.delete(req, res));
profileRoutes.patch("/user/update", authMiddleware, updateProfileValidator, (req: Request, res: Response) => profileController.update(req, res));


export default profileRoutes;
