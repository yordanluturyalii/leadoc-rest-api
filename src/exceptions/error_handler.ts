import type { NextFunction, Request, Response } from "express"

interface AppError extends Error {
    status?: number
}

export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    res.send({
        message: err.message
    })
}