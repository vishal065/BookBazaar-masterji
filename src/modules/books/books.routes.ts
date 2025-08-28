import { Router } from "express";
import {
  addBook,
  deleteBook,
  getBooks,
  getSingleBook,
  updateBook,
} from "./books.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import asyncHandler from "../../utils/asyncHandler";
import { validateBody } from "../../middlewares/validateBody.middleware";
import { BookSchema } from "../../validation/books.validation";
import { rbac } from "../../middlewares/rbac.middleware";
import { UserRole } from "../../constants";

const router = Router();

router
  .route("/add")
  .post(
    authMiddleware,
    rbac(UserRole.Admin),
    validateBody(BookSchema),
    asyncHandler(addBook),
  );

router
  .route("/update/:id")
  .put(
    authMiddleware,
    rbac(UserRole.Admin),
    validateBody(BookSchema),
    asyncHandler(updateBook),
  );

router.route("/getAll").get(asyncHandler(getBooks));

router.route("/get/:id").get(asyncHandler(getSingleBook));

router
  .route("/delete/:id")
  .delete(authMiddleware, rbac(UserRole.Admin), asyncHandler(deleteBook));

export { router as BooksRouter };
