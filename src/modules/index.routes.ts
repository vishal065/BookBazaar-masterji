import { Router } from "express"
import { AuthRouter } from "./auth/auth.routes"
import { BooksRouter } from "./books/books.routes"
import { CartRouter } from "./cart/cart.route"
import { ReviewRouter } from "./review/review.routes"



const router = Router()

router.use("/auth", AuthRouter)
router.use("/books", BooksRouter)
router.use("/cart", CartRouter)
router.use("/reviews", ReviewRouter)



export default router