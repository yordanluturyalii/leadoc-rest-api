import { Inject, Service } from "typedi";
import type { Request, Response } from "express";
import type { ProfileServices } from "../services/profile.services";
import { errorResponse, successResponse, validationErrorResponse } from "../utils/response.utils";
import { toString } from "express-validator/lib/utils";

@Service()
export class ProfileController {
    constructor(@Inject("ProfileService") public profileService: ProfileServices) {}

    async getMe(req: Request,res: Response){
        try{
        const userEmail = (req as any).user
        const user = await this.profileService.getMe(userEmail.email)

        successResponse(res, "Success Get Profile User", user, 200);
        }catch(error){
        errorResponse(res, "Failed login", error);
        }
    }

    async deleteAccount(req: Request,res: Response){
        try{
            const user = (req as any).user
            await this.profileService.deleteAccount(user.email) 

            successResponse(res, "Success delete Profile User", {}, 202);
        }catch(error){
            errorResponse(res, "Account Not Found", error, 404);
        }
    }
}