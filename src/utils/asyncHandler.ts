import { NextFunction, Request, RequestHandler, Response } from "express";

const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> | any => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
