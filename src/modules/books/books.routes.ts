import { Router } from "express"
import { addBook, getBooks, getSingleBook, updateBook } from "./books.controller"
import { authMiddleware } from "../../middlewares/auth.middleware"
import asyncHandler from "../../utils/asyncHandler"


const router = Router()

router.route("/add").post(authMiddleware, asyncHandler(addBook))
router.route("/update/:id").put(authMiddleware, asyncHandler(updateBook))
router.route("/getAll").get(asyncHandler(getBooks))
router.route("/get/:id").get(asyncHandler(getSingleBook))





export { router as BooksRouter }