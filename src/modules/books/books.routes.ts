import { Router } from "express"
import { addBook, deleteBook, getBooks, getSingleBook, updateBook } from "./books.controller"
import { authMiddleware } from "../../middlewares/auth.middleware"
import asyncHandler from "../../utils/asyncHandler"
import { validateBody } from "src/middlewares/validateBody.middleware"
import { BookSchema } from "src/validation/books.validation"


const router = Router()

router.route("/add").post(authMiddleware, validateBody(BookSchema), asyncHandler(addBook))
router.route("/update/:id").put(authMiddleware, validateBody(BookSchema), asyncHandler(updateBook))
router.route("/getAll").get(asyncHandler(getBooks))
router.route("/get/:id").get(asyncHandler(getSingleBook))
router.route("/delete/:id").delete(authMiddleware, asyncHandler(deleteBook))





export { router as BooksRouter }