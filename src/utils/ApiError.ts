/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request } from "express";
import EnvSecret, { EApplicationEnviroment } from "../constants/envVariables";

class ApiErrorHandler extends Error {
  public statusCode: number;
  public errors: any[] | null;
  public request?: object;

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

    const isProduction =
      EnvSecret.NODE_ENV === (EApplicationEnviroment.PRODUCTION as string);

    // Assign request details only if not production
    if (!isProduction && req) {
      this.request = {
        ip: req.ip,
        method: req.method,
        url: req.originalUrl,
      };
    }

    if (!isProduction) {
      if (stack) {
        this.stack = stack;
      } else {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  }
  public toJSON() {
    const isProduction =
      EnvSecret.NODE_ENV === (EApplicationEnviroment.PRODUCTION as string);

    return {
      statusCode: this.statusCode,
      message: this.message,
      errors: this.errors,
      ...(!isProduction && this.request ? { request: this.request } : {}),
      ...(!isProduction && this.stack ? { stack: this.stack } : {}),
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
