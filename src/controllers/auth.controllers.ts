import { Inject, Service } from "typedi";
import type { Request, Response } from "express";
import type { AuthServices } from "../services/auth.services";
import { errorResponse, successResponse, validationErrorResponse } from "../utils/response.utils";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

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
      res.cookie('token', user?.token, {
        httpOnly: true,
        secure: config.appEnvironment === "production",
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      })
      successResponse(res, "Success Create Account", user, 201);
    } catch (error) {
      errorResponse(res, "Failed To Create Account", error);
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

      const user = await this.authService.login(email, password, res);
      successResponse(res, "Success Login", user, 200);
    } catch (error) {
      errorResponse(res, "Failed login", error);
    }
  }
}
