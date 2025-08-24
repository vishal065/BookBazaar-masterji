import { Router } from "express";
import { AuthRouter } from "./auth/auth.routes";
import { BooksRouter } from "./books/books.routes";
import { CartRouter } from "./cart/cart.route";
import { ReviewRouter } from "./review/review.routes";
import { verifyApiKey } from "../middlewares/verify-api-key.middleware";
import { OrderRouter } from "./order/order.routes";
import { ApiKey } from "./api-key/api-key.routes";

const router = Router();

router.use("/auth", AuthRouter);
router.use("/api-key", ApiKey);
router.use("/books", verifyApiKey, BooksRouter);
router.use("/cart", CartRouter);
router.use("/reviews", ReviewRouter);
router.use("/orders", verifyApiKey, OrderRouter);

export default router;
