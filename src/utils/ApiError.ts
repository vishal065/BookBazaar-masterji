/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request } from "express";
import EnvSecret, { EApplicationEnviroment } from "../constants/envVariables";


class ApiErrorHandler extends Error {
    public statusCode: number;
    public errors: any[] | null;

    public request: object | null;

    constructor(
        statusCode: number = 500,
        message: string = "Something went wrong",
        req: Request | null = null,
        errors: any[] = [],
        stack: string = "",
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.request = req
            ? {
                ip: req.ip,
                method: req.method,
                url: req.originalUrl,
            }
            : null;

        //Production Env check
        if (EnvSecret.NODE_ENV === (EApplicationEnviroment.PRODUCTION as string) && req) {
            this.request = null;
        }
        
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    public toJSON() {
        return {
            statusCode: this.statusCode,
            message: this.message,
            errors: this.errors,
            // Include request details only if they're available (and allowed)
            ...(this.request ? { request: this.request } : {}),
            // Optionally include the stack trace in non-production environments
            ...(EnvSecret.NODE_ENV !== (EApplicationEnviroment.PRODUCTION as string)
                ? { stack: this.stack }
                : {}),
        };
    }
}

const ApiError = (
    statusCode: number,
    message: string,
    req: Request | null,
    errors: any[] = [],
) => {
    return new ApiErrorHandler(statusCode, message, req, errors);
};

export { ApiError };
