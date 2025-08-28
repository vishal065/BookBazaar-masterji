import express from "express";
import asyncHandler from "../../utils/asyncHandler";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { addReview, deleteReview, updateReview } from "./review.controller";
import { rbac } from "../../middlewares/rbac.middleware";

const router = express.Router();

router
  .route("/add")
  .post(authMiddleware, rbac("CUSTOMER"), asyncHandler(addReview));
router.route("/getAll").get(authMiddleware);
router
  .route("/update/:id")
  .put(authMiddleware, rbac("CUSTOMER"), asyncHandler(updateReview));
router
  .route("/remove/:id")
  .delete(authMiddleware, rbac("CUSTOMER"), asyncHandler(deleteReview));

export { router as ReviewRouter };
