import express from "express";
import asyncHandler from "../../utils/asyncHandler";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { addReview } from "./review.controller";

const router = express.Router();

router.post("/add", authMiddleware, asyncHandler(addReview));
router.get("/get", authMiddleware, );
router.put("/update/:id", authMiddleware, );
router.delete("/remove/:id", authMiddleware,);

export { router as ReviewRouter };
