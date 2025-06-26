import { Inject, Service } from "typedi";
import type { Request, Response } from "express";
import type { AuthServices } from "../services/auth.services";
import { errorResponse, successResponse, validationErrorResponse } from "../utils/response.utils";
import { validationResult } from "express-validator";
import { logger } from "../utils/logger.utils";

@Service()
export class AuthController {
  constructor(@Inject("AuthService") public authService: AuthServices) { }

  async authorize(req: Request, res: Response) {
    try {
      let id = req.session.user?.id;
      let username = req.session.user?.username;
      let name = req.session.user?.name;
      let accessToken = req.session.user?.accessToken;
      let profile_picture = req.session.user?.profile_picture;

      const result = await this.authService.authorize(
        id,
        username,
        accessToken,
        name,
        profile_picture,
      );
      successResponse(res, "Success Authorize", {
        token: result,
      });
    } catch (error) {
      errorResponse(res, "Failed To Authorize", error);
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
      successResponse(res, "Success Create Account", user, 201);
    } catch (error) {
      errorResponse(res, "Failed To Create Account", error);
    }
  }
}
