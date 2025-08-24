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

const router = express.Router();

router.post(
  "/add",
  authMiddleware,
  validateBody(cartSchema),
  asyncHandler(addToCart),
);
router.put(
  "/update/:id",
  authMiddleware,
  validateBody(cartSchema),
  asyncHandler(updateCart),
);
router.get("/get", authMiddleware, asyncHandler(getCartItems));
router.delete("/remove/:id", authMiddleware, asyncHandler(removeFromCart));

export { router as CartRouter };
