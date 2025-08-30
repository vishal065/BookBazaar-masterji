import { and, eq } from "drizzle-orm";
import { Request, Response } from "express";
import { db } from "../../config/db";
import { Reviews } from "../../model/Reviews.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { orderItems, Orders } from "../../model/Orders.model";

const addReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const bookId = req.params.bookId;
    const { rating, comment } = req.body;

    if (!userId) {
      res
        .status(401)
        .json(ApiError(401, "Unauthorized", req, ["User not authenticated"]));
      return;
    }
    if (!bookId || !rating) {
      res
        .status(400)
        .json(
          ApiError(400, "Bad Request", req, [
            "Book ID and rating are required",
          ]),
        );
      return;
    }

    const [purchased] = await db
      .select({ orderId: Orders.id })
      .from(Orders)
      .innerJoin(orderItems, eq(Orders.id, orderItems.orderId))
      .where(and(eq(Orders.userId, userId), eq(orderItems.bookId, bookId)))
      .limit(1);

    if (!purchased) {
      res
        .status(400)
        .json(
          ApiError(400, "Bad Request", req, [
            "You can only review books you have purchased",
          ]),
        );
      return;
    }

    const [newReview] = await db
      .insert(Reviews)
      .values({
        userId,
        bookId,
        rating,
        comment,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!newReview) {
      res
        .status(500)
        .json(
          ApiError(500, "Internal Server Error", req, ["Failed to add review"]),
        );
      return;
    }

    res
      .status(201)
      .json(ApiResponse(201, undefined, "Review added successfully"));
    return;
  } catch (error: any) {
    if (
      error.cause.code === "23505" &&
      error.cause.constraint === "unique_review"
    ) {
      res
        .status(400)
        .json(
          ApiError(400, "Bad Request", req, [
            "You have already reviewed this book",
          ]),
        );
      return;
    } else {
      res
        .status(500)
        .json(
          ApiError(
            500,
            "Internal Server Error",
            req,
            error instanceof Error
              ? [error.cause]
              : [
                  error.cause
                    ? error.cause
                    : error.message || "An unexpected error occurred",
                ],
          ),
        );
      return;
    }
  }
};

const updateReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    if (!userId) {
      res
        .status(401)
        .json(ApiError(401, "Unauthorized", req, ["User not authenticated"]));
      return;
    }
    if (!reviewId || !rating) {
      res
        .status(400)
        .json(
          ApiError(400, "Bad Request", req, [
            "Review ID and rating are required",
          ]),
        );
      return;
    }

    const [updatedReview] = await db
      .update(Reviews)
      .set({
        rating,
        comment,
        updatedAt: new Date(),
      })
      .where(and(eq(Reviews.id, reviewId), eq(Reviews.userId, userId)))
      .returning();

    if (!updatedReview) {
      res
        .status(500)
        .json(
          ApiError(500, "Internal Server Error", req, [
            "Failed to update review",
          ]),
        );
      return;
    }
    res
      .status(200)
      .json(ApiResponse(200, undefined, "Review updated successfully"));
    return;
  } catch (error: any) {
    res
      .status(500)
      .json(
        ApiError(
          500,
          "Internal Server Error",
          req,
          error.message || ["An error occurred while updating the review"],
        ),
      );
    return;
  }
};

const deleteReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { reviewId } = req.params;

    if (!userId) {
      res
        .status(401)
        .json(ApiError(401, "Unauthorized", req, ["User not authenticated"]));
      return;
    }
    if (!reviewId) {
      res
        .status(400)
        .json(ApiError(400, "Bad Request", req, ["Review ID is required"]));
      return;
    }

    const [deletedReview] = await db
      .delete(Reviews)
      .where(and(eq(Reviews.id, reviewId), eq(Reviews.userId, userId)))
      .returning();

    if (!deletedReview) {
      res
        .status(404)
        .json(
          ApiError(404, "Not Found", req, [
            "Review not found or already deleted",
          ]),
        );
      return;
    }

    res
      .status(200)
      .json(ApiResponse(200, undefined, "Review deleted successfully"));
    return;
  } catch (error: any) {
    res
      .status(500)
      .json(
        ApiError(
          500,
          "Internal Server Error",
          req,
          error.message || ["An error occurred while deleting the review"],
        ),
      );
    return;
  }
};

export { addReview, updateReview, deleteReview };
