import type { Response } from "express";

export const successResponse = (
    res: Response,
    message: string,
    data: any | null,
    code: number = 200
) => {
    const result = {
        message,
        data,
        error: null
    }

    res.status(code).json(result);
}


export const errorResponse = (
    res: Response,
    message: string,
    error: any | null,
    code: number = 500
) => {
    const result = {
        message,
        data: null,
        error: {
            message: error?.message,
            trace: error?.stack
        }
    };

    res.status(code).json(result);
}

export const validationErrorResponse = (
    res: Response,
    message: string,
    error: { type: string; message: string }[],
    code: 422
) => {
    const result = {
        message,
        data: null,
        error
    }
    res.status(code).json(result);
}