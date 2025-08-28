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
import { rbac } from "../../middlewares/rbac.middleware";

const router = express.Router();

router.post(
  "/place-order",
  authMiddleware,
  rbac("CUSTOMER"),
  asyncHandler(placeOrder),
);
router.put(
  "/payment-verify",
  authMiddleware,
  rbac("CUSTOMER"),
  asyncHandler(verifyPayment),
);
router.get(
  "/get",
  authMiddleware,
  rbac("CUSTOMER"),
  asyncHandler(listMyOrders),
);
router.get(
  "/get/:id",
  authMiddleware,
  rbac("CUSTOMER"),
  asyncHandler(getOrderById),
);
router.put(
  "/cancel/:id",
  authMiddleware,
  rbac("CUSTOMER"),
  asyncHandler(cancelOrder),
);

export { router as OrderRouter };
