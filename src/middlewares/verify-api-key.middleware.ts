import { eq } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import { db } from "../config/db";
import { ApiKeys } from "../model/api-key.model";
import { ApiError } from "../utils/ApiError";

export const verifyApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const apiKey = req.header("x-api-key");

    if (!apiKey) {
      res
        .status(401)
        .json(ApiError(401, "Unauthorized", req, ["API key is required"]));
      return;
    }

    const keyRecord = await db
      .select()
      .from(ApiKeys)
      .where(eq(ApiKeys.key, apiKey))
      .limit(1);

    if (keyRecord.length === 0) {
      res
        .status(403)
        .json(
          ApiError(403, "Forbidden", req, [
            "The provided API key is not valid or does not exist.",
          ]),
        );
      return;
    }

    next();
  } catch (error) {
    res
      .status(500)
      .json(
        ApiError(500, "Server error", req, [
          "An error occurred while verifying the API key",
        ]),
      );
    return;
  }
};
