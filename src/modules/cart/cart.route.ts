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

const router = express.Router();

router.post(
  "/add",
  authMiddleware,
  rbac("CUSTOMER"),
  validateBody(cartSchema),
  asyncHandler(addToCart),
);
router.put(
  "/update/:id",
  authMiddleware,
  rbac("CUSTOMER"),
  validateBody(cartSchema),
  asyncHandler(updateCart),
);
router.get(
  "/get",
  authMiddleware,
  rbac("CUSTOMER"),
  asyncHandler(getCartItems),
);
router.delete(
  "/remove/:id",
  authMiddleware,
  rbac("CUSTOMER"),
  asyncHandler(removeFromCart),
);

export { router as CartRouter };
