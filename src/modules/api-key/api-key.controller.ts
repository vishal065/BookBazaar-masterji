import { Request, Response } from "express";
import crypto from "crypto";
import { db } from "../../config/db";
import { ApiKeys } from "../../model/api-key.model";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { eq } from "drizzle-orm";

const generateApiKey = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;
    const key = crypto.randomBytes(24).toString("hex");

    if (!userId) {
      res
        .status(400)
        .json(
          ApiError(400, "User ID is required", req, [
            "User ID is not provided",
          ]),
        );
      return;
    }

    const [existingKey] = await db
      .select()
      .from(ApiKeys)
      .where(eq(ApiKeys.userId, userId));

    if (existingKey) {
      const [result] = await db
        .update(ApiKeys)
        .set({ key })
        .where(eq(ApiKeys.userId, userId))
        .returning({ id: ApiKeys.id });

      if (!result) {
        res
          .status(500)
          .json(
            ApiError(500, "Failed to regenerate API key", req, [
              "An error occurred while regenerating API key",
            ]),
          );
        return;
      }
      res
        .status(201)
        .json(
          ApiResponse(201, { apiKey: key }, "API key regenerated successfully"),
        );
      return;
    }

    const result = await db
      .insert(ApiKeys)
      .values({
        userId,
        key,
      })
      .returning({ id: ApiKeys.id });

    if (!result) {
      res
        .status(500)
        .json(
          ApiError(500, "Failed to generate API key", req, [
            "An error occurred while generating API key",
          ]),
        );
      return;
    }

    res
      .status(201)
      .json(
        ApiResponse(201, { apiKey: key }, "API key generated successfully"),
      );
    return;
  } catch (error: any) {
    res
      .status(500)
      .json(
        ApiError(500, "Server error", req, [
          error.message || "An error occurred while generating API key",
        ]),
      );
    return;
  }
};

const getApiKey = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;

    if (!userId) {
      res
        .status(400)
        .json(
          ApiError(400, "User ID is required", req, [
            "User ID is not provided",
          ]),
        );
      return;
    }

    const [result] = await db
      .select()
      .from(ApiKeys)
      .where(eq(ApiKeys.userId, userId));

    if (!result) {
      res
        .status(500)
        .json(
          ApiError(500, "Api key not found please generate one", req, [
            "An error occurred while fetching API key",
          ]),
        );
      return;
    }

    res
      .status(201)
      .json(
        ApiResponse(201, { key: result.key }, "API key fetched successfully"),
      );
    return;
  } catch (error: any) {
    res
      .status(500)
      .json(
        ApiError(500, "Server error", req, [
          error.message || "An error occurred while generating API key",
        ]),
      );
    return;
  }
};

export { generateApiKey, getApiKey };
