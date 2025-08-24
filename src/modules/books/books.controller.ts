import { Request, Response } from "express";
import { eq, sql } from "drizzle-orm";
import { db } from "../../config/db";
import { Books } from "../../model/Books.model";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { Reviews } from "../../model/Reviews.model";

const addBook = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const [book] = await db.insert(Books).values(data).returning();

    if (!book) {
      res
        .status(500)
        .json(
          ApiError(500, "Failed to create book", req, [
            "An error occurred while creating the book",
          ]),
        );
      return;
    }
    res.status(201).json(ApiResponse(201, book, "Book created successfully"));
    return;
  } catch (error: any) {
    res
      .status(500)
      .json(
        ApiError(500, "Server error", req, [
          error.message || "An error occurred while creating the book",
        ]),
      );
    return;
  }
};

const updateBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const [book] = await db
      .update(Books)
      .set(data)
      .where(eq(Books.id, id))
      .returning();

    if (!book) {
      res
        .status(500)
        .json(
          ApiError(500, "Failed to update book", req, [
            "An error occurred while updating the book",
          ]),
        );
      return;
    }
    res.status(200).json(ApiResponse(200, book, "Book updated successfully"));
    return;
  } catch (error: any) {
    res
      .status(500)
      .json(
        ApiError(500, "Server error", req, [
          error.message || "An error occurred while updating the book",
        ]),
      );
    return;
  }
};
const getBooks = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const books = await db
      .select()
      .from(Books)
      .leftJoin(Reviews, eq(Books.id, Reviews.bookId))
      .limit(limit)
      .offset(offset);

    if (books.length === 0) {
      res.status(404).json(ApiResponse(404, [], "No books found"));
      return;
    }

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(Books);

    const total = Number(totalResult[0].count);
    const totalPages = Math.ceil(total / limit);

    const data = {
      books,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };

    res.status(200).json(ApiResponse(200, data, "Books fetched successfully"));
    return;
  } catch (error) {
    res
      .status(500)
      .json(
        ApiError(500, "Server error", req, [
          "An error occurred while fetching books",
        ]),
      );
    return;
  }
};

const getSingleBook = async (_req: Request, res: Response) => {
  try {
    const { id } = _req.params;

    if (!id) {
      res
        .status(400)
        .json(
          ApiError(400, "Invalid Book ID", _req, ["Book ID is not provided"]),
        );
      return;
    }

    const [book] = await db
      .select()
      .from(Books)
      .where(eq(Books.id, id))
      .leftJoin(Reviews, eq(Books.id, Reviews.bookId))
      .limit(1);

    if (!book) {
      res
        .status(404)
        .json(
          ApiError(404, "Book not found", _req, [
            "No book found with the provided ID",
          ]),
        );
      return;
    }

    res.json(ApiResponse(200, book, "Book retrieved successfully"));
    return;
  } catch (error) {
    res
      .status(500)
      .json(
        ApiError(500, "Server error", _req, [
          "An error occurred while retrieving the book",
        ]),
      );
    return;
  }
};

const deleteBook = async (_req: Request, res: Response) => {
  try {
    const { id } = _req.params;

    if (!id) {
      res
        .status(400)
        .json(
          ApiError(400, "Invalid Book ID", _req, ["Book ID is not provided"]),
        );
      return;
    }

    //No Need to delete reviews and from cart separately as they are linked to the book
    //and will be deleted automatically if foreign key constraints are set with ON DELETE CASCADE
    const [book] = await db.delete(Books).where(eq(Books.id, id)).returning();

    if (!book) {
      res
        .status(500)
        .json(
          ApiError(500, "Failed to delete book", _req, [
            "An error occurred while deleting the book",
          ]),
        );
      return;
    }

    res
      .status(200)
      .json(ApiResponse(200, undefined, "Book deleted successfully"));
    return;
  } catch (error: any) {
    res
      .status(500)
      .json(
        ApiError(500, "Server error", _req, [
          error.message || "An error occurred while deleting the book",
        ]),
      );
    return;
  }
};

export { addBook, updateBook, getBooks, getSingleBook, deleteBook };
