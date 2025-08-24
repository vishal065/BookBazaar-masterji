import express from "express";
import asyncHandler from "../../utils/asyncHandler";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  cancelOrder,
  getOrderById,
  listMyOrders,
  placeOrder,
  verifyPayment,
} from "./order.controller";

const router = express.Router();

router.post("/place-order", authMiddleware, asyncHandler(placeOrder));
router.put("/payment", authMiddleware, asyncHandler(verifyPayment));
router.get("/get", authMiddleware, asyncHandler(listMyOrders));
router.get("/get/:id", authMiddleware, asyncHandler(getOrderById));
router.put("/cancel/:id", authMiddleware, asyncHandler(cancelOrder));

export { router as OrderRouter };
