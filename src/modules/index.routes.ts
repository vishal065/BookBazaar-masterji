import { Router } from "express"
import { AuthRouter } from "./auth/auth.routes"
import { BooksRouter } from "./books/books.routes"



const router = Router()

router.use("/auth", AuthRouter)
router.use("/books", BooksRouter)




export default router