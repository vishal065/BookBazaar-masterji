import { Router } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { generateApiKey, getApiKey } from "./api-key.controller";

const router = Router();

router.route("/generate").get(authMiddleware, asyncHandler(generateApiKey));
router.route("/").get(authMiddleware, asyncHandler(getApiKey));

export { router as ApiKey };
