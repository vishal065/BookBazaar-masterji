import express from "express";
import asyncHandler from "../../utils/asyncHandler";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { addToCart, getCartItems, removeFromCart, updateCart } from "./cart.controller";

const router = express.Router();

router.post("/add", authMiddleware, asyncHandler(addToCart));
router.get("/get", authMiddleware, asyncHandler(getCartItems));
router.put("/update/:id", authMiddleware, asyncHandler(updateCart));
router.delete("/remove/:id", authMiddleware, asyncHandler(removeFromCart));

export { router as CartRouter };
