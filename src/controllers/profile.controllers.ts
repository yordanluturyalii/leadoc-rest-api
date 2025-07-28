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

    async checkStatus(req:Request, res:Response){
        try{
            const user = (req as any).user
            if(!user.id){
                return successResponse(res, "Account Not Found", {
                    user:{
                        "connection_status": "DISCONNECTED",
                        "username": "",
                        "profile_picture":  "",
                        "profile_url": ""
                    }
                }, 404);  
            }

            const result = await this.profileService.checkStatus(user?.id)
            if(result.user.connection_status == "DISCONNECTED"){
                return successResponse(res, "Account Not Found", result, 404);  
            }else {
                return successResponse(res, "Success Get Status Connection", result);
            }
        }catch(error){
            errorResponse(res, "Fails get status", error);
        }

    }
}