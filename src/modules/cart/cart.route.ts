import express from "express";
import asyncHandler from "../../utils/asyncHandler";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  addToCart,
  getCartItems,
  removeFromCart,
  updateCart,
} from "./cart.controller";
import { validateBody } from "../../middlewares/validateBody.middleware";
import { cartSchema } from "../../validation/cart.validation";
import { rbac } from "../../middlewares/rbac.middleware";
import { UserRole } from "../../constants";

const router = express.Router();

router.post(
  "/add",
  authMiddleware,
  rbac(UserRole.Customer),
  validateBody(cartSchema),
  asyncHandler(addToCart),
);
router.put(
  "/update/:id",
  authMiddleware,
  rbac(UserRole.Customer),
  validateBody(cartSchema),
  asyncHandler(updateCart),
);
router.get(
  "/get",
  authMiddleware,
  rbac(UserRole.Customer),
  asyncHandler(getCartItems),
);
router.delete(
  "/remove/:id",
  authMiddleware,
  rbac(UserRole.Customer),
  asyncHandler(removeFromCart),
);

export { router as CartRouter };
