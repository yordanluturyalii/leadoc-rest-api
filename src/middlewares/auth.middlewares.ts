import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.utils";
import { errorResponse } from "../utils/response.utils";
import jwt from "jsonwebtoken"
import { config } from "../config/config";

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req?.cookies?.token;
  logger.info("User: %o", token);

  if (!token) return errorResponse(res, "Unauthorized", {}, 401);

  try {
    const user = jwt.verify(token, config.jwtSecret) as any;
    (req as any).user = user;
    next()
  } catch (error) {
    logger.error("Error: %o", error);
    return errorResponse(res, "Token Invalid", {}, 401);
  }
}
