import { Inject, Service } from "typedi";
import type { OrderServices } from "../services/order.services";
import type { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/response.utils";
import { logger } from "../utils/logger.utils";

@Service()
export class OrderController {
    constructor(
        @Inject("OrderServices") public orderService: OrderServices
    ) { }

    async pay(req: Request, res: Response) {
        try {
            const user = (req as any).user;
            if (!user) errorResponse(res, "Unauthorized", {}, 401);

            const packageName = req.body.package_name;

            const paymentLink = await this.orderService.pay((user?.id as string), packageName);

            if (paymentLink instanceof Error) errorResponse(res, paymentLink.message, {}, 422);
            successResponse(res, "Succes Order", {url: paymentLink}, 201);
        } catch (error) {
            logger.error("From Order Controller - Error: %o", error);
            errorResponse(res, "Internal Server Error", {});
        }
    }
}