import { and, eq } from "drizzle-orm";
import { Request, Response } from "express";
import { db } from "../../config/db";
import { Books } from "../../model/Books.model";
import { CartItems } from "../../model/Cart.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";

const addToCart = async (req: Request, res: Response) => {
    try {
        const { bookId, ...data } = req.body;
        const userId = req.user?.id

        if (!userId) {
            res.status(400).json(ApiError(400, "unauthorized", req, ["User ID is not provided"]))
            return
        }

        const [book] = await db.select()
            .from(Books)
            .where(eq(Books.id, bookId))
            .limit(1)

        if (!book) {
            res.status(404).json(ApiError(404, "Book not found", req, ["No book found with the provided ID"]))
            return
        }

        const [cart] = await db.select()
            .from(CartItems)
            .where(and(eq(Books.id, book.id), eq(CartItems.userId, userId)))
            .limit(1)

        if (cart) {
            res.status(409).json(ApiError(409, "Book already in cart", req, ["Book already in cart"]))
            return
        }

        const [cartItem] = await db.insert(CartItems)
            .values({ ...data, userId, bookId: book.id })
            .returning()

        if (!cartItem) {
            res.status(500).json(ApiError(500, "Failed to add book to cart", req, ["An error occurred while adding book to cart"]))
            return
        }

        res.status(200).json(ApiResponse(200, cartItem, "Book added to cart successfully"))
        return

    } catch (error) {
         res.status(500).json(ApiError(500, "Server error", req, ["An error occurred while retrieving the book"]))
        return

    }
}

const removeFromCart = async (req: Request, res: Response) => {
    try {

        const { id } = req.params;
        const userId = req.user?.id
        if (!userId) {
            res.status(400).json(ApiError(400, "unauthorized", req, ["User ID is not provided"]))
            return
        }
        if (!id) {
            res.status(400).json(ApiError(400, "Invalid cart item ID", req, ["Cart item ID is not provided"]))
            return
        }

        const [cartItem] = await db.delete(CartItems)
            .where(and(eq(CartItems.id, id), eq(CartItems.userId, userId)))
            .returning()

        if (!cartItem) {
            res.status(404).json(ApiError(404, "Cart item not found", req, ["No cart item found with the provided ID"]))
            return
        }

        res.status(200).json(ApiResponse(200, cartItem, "Cart item removed successfully"))
        return
    } catch (error) {
        res.status(500).json(ApiError(500, "Server error", req, ["An error occurred while removing cart item"]))
        return
    }
}

const getCartItems = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json(ApiError(401, "unauthorized", req, ["User ID is not provided"]));
            return
        }

        const items = await db
            .select()
            .from(CartItems)
            .where(eq(CartItems.userId, userId))
            .execute();

        if (items.length === 0) {
            res.status(200).json(ApiResponse(200, [], "Cart is empty"));
            return
        }

        res.status(200).json(ApiResponse(200, items, "Cart items retrieved successfully"));
        return
    } catch (error) {
        res.status(500).json(ApiError(500, "Server error", req, ["An error occurred while retrieving cart items"]));
        return
    }
};

const updateCart = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id
        const quantity = +req.body.quantity

        if (!userId) {
            res.status(400).json(ApiError(400, "unauthorized", req, ["User ID is not provided"]))
            return
        }

        if (!id) {
            res.status(400).json(ApiError(400, "Invalid cart item ID", req, ["Cart item ID is not provided"]))
            return
        }
        if (quantity < 0 || !quantity) {
            res.status(400).json(ApiError(400, "Invalid quantity", req, ["Quantity must be a positive number"]))
            return
        }

        if (quantity === 0) {
            const [cartItem] = await db.delete(CartItems)
                .where(and(eq(CartItems.id, id), eq(CartItems.userId, userId)))
                .returning()

            if (!cartItem) {
                res.status(404).json(ApiError(404, "Cart item not found", req, ["No cart item found with the provided ID"]))
                return
            }
            res.status(200).json(ApiResponse(200, cartItem, "Cart removed successfully"))
            return
        }


        const [cartItem] = await db.update(CartItems)
            .set({ quantity })
            .where(and(eq(CartItems.id, id), eq(CartItems.userId, userId)))
            .returning()

        if (!cartItem) {
            res.status(404).json(ApiError(404, "Cart item not found", req, ["No cart item found with the provided ID"]))
            return
        }

        res.status(200).json(ApiResponse(200, cartItem, "Cart quantity updated successfully"))
        return

    } catch (error) {
        res.status(500).json(ApiError(500, "Server error", req, ["An error occurred while updating cart items"]));
        return
    }
}

export { addToCart, removeFromCart, getCartItems, updateCart }