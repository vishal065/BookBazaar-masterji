import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

const rbac = (requiredRole: "ADMIN" | "CUSTOMER") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        res
          .status(401)
          .json(ApiError(401, "Unauthorized", req, ["User not authenticated"]));
        return;
      }
      const userRole = user.role;
      if (userRole !== requiredRole) {
        res
          .status(403)
          .json(ApiError(403, "Forbidden", req, ["Access denied"]));
        return;
      }
      next();
    } catch (error) {
      res
        .status(500)
        .json(
          ApiError(500, "Internal Server error", req, [
            "An error occurred while processing the request",
          ]),
        );
      return;
    }
  };
};

export { rbac };
