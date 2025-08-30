import express from "express";
import asyncHandler from "../../utils/asyncHandler";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { addReview, deleteReview, updateReview } from "./review.controller";
import { rbac } from "../../middlewares/rbac.middleware";
import { validateBody } from "../../middlewares/validateBody.middleware";
import { reviewSchema } from "../../validation/reviewSchema";

const router = express.Router();

router
  .route("/add/:bookId")
  .post(
    authMiddleware,
    rbac("CUSTOMER"),
    validateBody(reviewSchema),
    asyncHandler(addReview),
  );
router.route("/getAll").get(authMiddleware);
router
  .route("/update/:reviewId")
  .put(
    authMiddleware,
    rbac("CUSTOMER"),
    validateBody(reviewSchema),
    asyncHandler(updateReview),
  );
router
  .route("/remove/:reviewId")
  .delete(authMiddleware, rbac("CUSTOMER"), asyncHandler(deleteReview));

export { router as ReviewRouter };
