import { Router, type Request, type Response } from "express";
import setupDI from "../utils/di.utils";
import Container from "typedi";
import { OrderController } from "../controllers/order.controllers";
import authMiddleware from "../middlewares/auth.middlewares";

setupDI();
const orderRoutes = Router();
const orderController = Container.get(OrderController);

orderRoutes.use(authMiddleware);

orderRoutes.post("/order", (req: Request, res: Response) => {
    orderController.pay(req, res);
});

export default orderRoutes;