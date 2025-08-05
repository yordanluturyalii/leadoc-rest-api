import { type Request, type Response, Router } from "express";
import passport from "passport";
import Container from "typedi";
import { AuthController } from "../controllers/auth.controllers";
import authMiddleware from "../middlewares/auth.middlewares";
import setupDI from "../utils/di.utils";
import { loginValidator } from "../validations/login.validation";
import { registerValidator } from "../validations/register.validation";
import { resetPasswordValidator } from "../validations/reset-password.validation";
import { sendEmailValidator } from "../validations/send-email.validation";

setupDI();
const authRoutes = Router();
const authController = Container.get(AuthController);

authRoutes.get(
	"/auth",
	passport.authenticate("github", { scope: ["user", "repo"] }),
);

authRoutes.get(
	"/auth/callback",
	passport.authenticate("github"),
	(req: Request, res: Response) => {
		authController.authorize(req, res);
	},
);

authRoutes.post(
	"/auth/register",
	registerValidator,
	(req: Request, res: Response) => authController.register(req, res),
);
authRoutes.post("/auth/login", loginValidator, (req: Request, res: Response) =>
	authController.login(req, res),
);
authRoutes.post(
	"/auth/send-email",
	sendEmailValidator,
	(req: Request, res: Response) =>
		authController.sendResetPasswordUrl(req, res),
);
authRoutes.post(
	"/auth/reset-password",
	resetPasswordValidator,
	(req: Request, res: Response) => authController.resetPassword(req, res),
);
authRoutes.post("/auth/logout", authMiddleware, (req: Request, res: Response) =>
	authController.logout(req, res),
);

export default authRoutes;
