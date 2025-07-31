import { Inject, Service } from "typedi";
import type { Request, Response } from "express";
import type { AuthServices } from "../services/auth.services";
import { errorResponse, successResponse, validationErrorResponse } from "../utils/response.utils";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { logger } from "../utils/logger.utils";

@Service()
export class AuthController {
  constructor(@Inject("AuthService") public authService: AuthServices) { }

  async authorize(req: Request, res: Response) {
    try {
      const user = req.user as any;

      const token = jwt.sign(
        {
          id: user.id,
          name: user.name,
          username: user.username,
        },
        config.jwtSecret,
        { expiresIn: "7d" },
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: config.appEnvironment === "production",
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000
      });

      res.redirect(`${config.frontendUrl}/dashboard`);
    } catch (error) {
      res.redirect(`${config.frontendUrl}/register`);
    }
  }

  async register(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({
          type: err.type,
          message: err.msg
        }));
        return validationErrorResponse(res, "Invalid Request Body", formattedErrors, 422);
      }

      const name = req.body.name;
      const email = req.body.email;
      const password = req.body.password;
      const passwordConfirmation = req.body.password_confirmation;

      const user = await this.authService.register(name, email, password, passwordConfirmation);
      logger.info("User registered successfully: %o", user);
      res.cookie('token', user?.token, {
        httpOnly: true,
        secure: config.appEnvironment === "production",
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      })
      successResponse(res, "Success Create Account", user, 201);
    } catch (error) {
      errorResponse(res, "Internal Server Error", error);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({
          type: err.type,
          message: err.msg
        }));
        return validationErrorResponse(res, "Invalid Request Body", formattedErrors, 422);
      }

      const email = req.body.email;
      const password = req.body.password;


      const user = await this.authService.login(email, password);
      res.cookie('token', user?.token, {
        httpOnly: true,
        secure: config.appEnvironment === "production",
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      })

      successResponse(res, "Success Login", user, 200);
    } catch (error) {
      errorResponse(res, "Failed login", error);
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const user = (req as any).user

      const exists = await this.authService.logout(user)
      if (exists == false) {
        errorResponse(res, "Account Not Found", {}, 404);
      } else {
        res.clearCookie("token", {
          httpOnly: true,
          secure: config.appEnvironment === "production",
          sameSite: "strict"
        });

        successResponse(res, "Success Logout", {}, 200);
      }

    } catch (error) {
      errorResponse(res, "Failed Logout", error);
    }
  }

  async sendResetPasswordUrl(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({
          type: err.type,
          message: err.msg
        }));
        return validationErrorResponse(res, "Invalid Request Body", formattedErrors, 422);
      }

      const email = req.body.email;
      const response = await this.authService.sendEmail(email);
      if (response.token) {
        successResponse(res, "Verification email sent successfully", response.token, 200);
      } else {
        errorResponse(res, "Failed to send verification email", {}, 400);
      }
    } catch (error) {
      errorResponse(res, "Internal Server Error", error);
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({
          type: err.type,
          message: err.msg
        }));
        return validationErrorResponse(res, "Invalid Request Body", formattedErrors, 422);
      }

      const email = req.body.email;
      const newPassword = req.body.new_password;
      const token = req.body.token;

      const response = await this.authService.resetPassword(email, newPassword, token);
      if (response.message === "Invalid or expired token.") {
        errorResponse(res, response.message, {}, 400);
      } else {
        successResponse(res, "Password reset successfully", {}, 200);
      }
    } catch (error) {
      errorResponse(res, "Internal Server Error", error);
    }
  }
}
