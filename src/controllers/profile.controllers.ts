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

    async delete(req: Request,res: Response){
        try{
            const user = (req as any).user
            const result = await this.profileService.delete(user.email)

            if (!result && result != undefined){
                errorResponse(res, "Account Not Found", {}, 404);  
            } else {
                successResponse(res, "Success delete Profile User", {}, 202);
            }
        }catch(error){
            errorResponse(res, "Account Not Found", error);
        }
    }
}