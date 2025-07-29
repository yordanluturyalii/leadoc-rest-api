import { Inject, Service } from "typedi";
import type { Request, Response } from "express";
import type { ProfileServices } from "../services/profile.services";
import { errorResponse, successResponse, validationErrorResponse } from "../utils/response.utils";
import { toString } from "express-validator/lib/utils";
import { validationResult } from "express-validator";
import { config } from "../config/config";

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
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const formattedErrors = errors.array().map(err => ({
                type: err.type,
                message: err.msg
                }));
                return validationErrorResponse(res, "Invalid Request Body", formattedErrors, 422);
            }
            
            const user = (req as any).user
            const password = req.body.password
            const result = await this.profileService.delete(user.email, password)

            if (!result && result != undefined){
                errorResponse(res, "Account Not Found", {}, 404);  
            } else {
                successResponse(res, "Success delete Profile User", {}, 202);
            }
        }catch(error){
            errorResponse(res, "Account Not Found", error);
        }
    }
    
    async update(req:Request, res:Response){
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const formattedErrors = errors.array().map(err => ({
                    type: err.type,
                    message: err.msg
                }));
                return validationErrorResponse(res, "Invalid Request Body", formattedErrors, 422);
            }
            
            const cookie = (req as any).user
            const name = req.body.name
            const email = req.body.email
            const result = await this.profileService.update(name, email, cookie)
            
            if (!result && result != undefined){
                errorResponse(res, "Account Not Found", {}, 404);  
            } else {
                res.cookie('token', result, {
                    httpOnly: true,
                    secure: config.appEnvironment === "production",
                    sameSite: 'strict',
                    maxAge: 24 * 60 * 60 * 1000
                })
                successResponse(res, "Success update profile User", {}, 202);
            }
        }catch(error){
            errorResponse(res, "Fails update data", error);
        }   
    }


    async updatePassword(req:Request, res:Response){
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const formattedErrors = errors.array().map(err => ({
                    type: err.type,
                    message: err.msg
                }));
                return validationErrorResponse(res, "Invalid Request Body", formattedErrors, 422);
            }
            
            const cookie = (req as any).user
            const new_password = req.body.new_password
            const password = req.body.password
            const result = await this.profileService.updatePassword(new_password, password, cookie)
            
            if(result == "Password is required") return errorResponse(res, "Password is required", {}, 422);  
            if(result == "Password Incorrect") return errorResponse(res, "Password Incorrect", {}, 422);  
            return successResponse(res, "Success update password profile User", {}, 202)
            
        }catch(error){
            return errorResponse(res, "Fails update data", error);
        }   
    }
}