import { Router } from "express";
import { AuthRouter } from "./auth/auth.routes";
import { BooksRouter } from "./books/books.routes";
import { CartRouter } from "./cart/cart.route";
import { ReviewRouter } from "./review/review.routes";
import { OrderRouter } from "./order/order.routes";

const router = Router();

router.use("/auth", AuthRouter);
router.use("/books", BooksRouter);
router.use("/cart", CartRouter);
router.use("/reviews", ReviewRouter);
router.use("/orders", OrderRouter);

export default router;
