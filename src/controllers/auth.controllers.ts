import { Inject, Service } from "typedi";
import type { Request, Response } from "express";
import type { AuthServices } from "../services/auth.services";
import { errorResponse, successResponse } from "../utils/response.utils";

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

            const result = await this.authService.authorize(id, username, accessToken, name, profile_picture);
            successResponse(res, "Success Authorize", {
                token: result
            });
        } catch (error) {
            errorResponse(res, "Failed To Authorize", error);
        }
    }
}
