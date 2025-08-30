import express from "express";
import asyncHandler from "../../utils/asyncHandler";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { addReview, deleteReview, updateReview } from "./review.controller";
import { rbac } from "../../middlewares/rbac.middleware";
import { validateBody } from "../../middlewares/validateBody.middleware";
import { reviewSchema } from "../../validation/reviewSchema";
import { UserRole } from "../../constants";

const router = express.Router();

router
  .route("/add/:bookId")
  .post(
    authMiddleware,
    rbac(UserRole.Customer),
    validateBody(reviewSchema),
    asyncHandler(addReview),
  );
router.route("/getAll").get(authMiddleware);
router
  .route("/update/:reviewId")
  .put(
    authMiddleware,
    rbac(UserRole.Customer),
    validateBody(reviewSchema),
    asyncHandler(updateReview),
  );
router
  .route("/remove/:reviewId")
  .delete(authMiddleware, rbac(UserRole.Customer), asyncHandler(deleteReview));

export { router as ReviewRouter };
