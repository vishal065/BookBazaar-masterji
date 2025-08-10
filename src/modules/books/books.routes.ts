import { Router } from "express"
import asyncHandler from "src/utils/asyncHandler"
import { addBook, getBooks, getSingleBook, updateBook } from "./books.controller"
import { authMiddleware } from "src/middlewares/auth.middleware"


const router = Router()

router.route("/add").post(authMiddleware, asyncHandler(addBook))
router.route("/update/:id").put(authMiddleware, asyncHandler(updateBook))
router.route("/getAll").get(asyncHandler(getBooks))
router.route("/get/:id").get(asyncHandler(getSingleBook))





export { router as BooksRouter }