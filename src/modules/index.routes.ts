import { Router } from "express"
import { AuthRouter } from "./auth/auth.routes"
import { BooksRouter } from "./books/books.routes"
import { CartRouter } from "./cart/cart.route"



const router = Router()

router.use("/auth", AuthRouter)
router.use("/books", BooksRouter)
router.use("/cart", CartRouter)



export default router