import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.utils";

interface AppError extends Error {
	status?: number;
}

export const errorHandler = (
	err: AppError,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	logger.error("Error: %O", err);
	res.send({
		message: err.message,
		stack: err.stack,
	});
};
