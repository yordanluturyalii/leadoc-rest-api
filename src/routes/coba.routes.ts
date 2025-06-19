import { Router } from "express";
import Container from "typedi";
import { CobaController } from "../controllers/coba.controllers";
import setupDI from "../utils/di.utils";

setupDI();
const routes = Router();
const cobaController = Container.get(CobaController);

routes.get("/", (req, res) => {
    cobaController.getCoba(req, res);
});

export default routes;
