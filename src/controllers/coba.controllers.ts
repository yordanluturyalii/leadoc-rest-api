import { Inject, Service } from "typedi";
import type { Request, Response } from "express";
import type { CobaServices } from "../services/coba.services";
import { logger } from "../utils/logger.utils";

@Service()
export class CobaController {
    constructor(@Inject("CobaService") public cobaService: CobaServices) {}

    getCoba(req: Request, res: Response) {
        try {
            const result = this.cobaService.getAllCoba();
            res.status(200).json({
                message: "Success",
                data: result,
            });
        } catch (error) {
            console.error("Error in getCoba:", error);
            res.status(500).json({
                message: "Internal Server Error"
            });
        }
    }
}
