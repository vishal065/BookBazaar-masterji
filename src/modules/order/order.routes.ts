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
import { UserRole } from "../../constants";

const router = express.Router();

router.post(
  "/place-order",
  authMiddleware,
  rbac(UserRole.Customer),
  asyncHandler(placeOrder),
);
router.put(
  "/payment-verify",
  authMiddleware,
  rbac(UserRole.Customer),
  asyncHandler(verifyPayment),
);
router.get(
  "/get",
  authMiddleware,
  rbac(UserRole.Customer),
  asyncHandler(listMyOrders),
);
router.get(
  "/get/:id",
  authMiddleware,
  rbac(UserRole.Customer),
  asyncHandler(getOrderById),
);
router.put(
  "/cancel/:id",
  authMiddleware,
  rbac(UserRole.Customer),
  asyncHandler(cancelOrder),
);

export { router as OrderRouter };
