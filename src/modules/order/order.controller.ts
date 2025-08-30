import { Request, Response } from "express";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "../../config/db";
import { Orders, orderItems } from "../../model/Orders.model";
import { CartItems } from "../../model/Cart.model";
import { Books } from "../../model/Books.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { sendOrderConfirmationEmail } from "../../utils/sendMail";
import { v4 as uuidv4 } from "uuid";
import {
  generateOrderEmailHTML,
  generateOrderTableData,
} from "../../constants/mailTemplate";
import { Payments } from "../../model/payment.model";
import { OrderStatus, PaymentStatus } from "../../constants";

const placeOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res
        .status(401)
        .json(ApiError(401, "Unauthorized", req, ["User not authenticated"]));
      return;
    }

    let customerCart = await db
      .select({
        cartId: CartItems.id,
        bookId: CartItems.bookId,
        quantity: CartItems.quantity,
        price: Books.price,
        stock: Books.stock,
      })
      .from(CartItems)
      .leftJoin(Books, eq(Books.id, CartItems.bookId))
      // .innerJoin(Books, eq(Books.id, CartItems.bookId))
      .where(eq(CartItems.userId, userId));

    if (customerCart.length === 0) {
      res
        .status(400)
        .json(
          ApiError(400, "Cart is empty", req, [
            "Add items to cart before placing an order",
          ]),
        );
      return;
    }

    const outOfStockItems = customerCart.filter(
      (item) => item.stock == null || item.quantity > item.stock,
    );

    if (outOfStockItems.length > 0) {
      customerCart = customerCart.filter(
        (item) => !outOfStockItems.some((o) => o.cartId === item.cartId),
      );
    }

    const totalAmount = customerCart.reduce((sum, r) => {
      const unit = Number(r.price ?? 0);
      return sum + unit * r.quantity;
    }, 0);

    // transaction: create order, items, clear cart
    const created = await db.transaction(async (tx) => {
      const [order] = await tx
        .insert(Orders)
        .values({
          userId,
          totalAmount: totalAmount.toFixed(2),
          status: OrderStatus.Pending,
        })
        .returning();

      if (!order) throw new Error("Failed to create order");

      const Razorpay = {
        userId: order.userId,
        razorpay_order_id: order.id,
        razorpay_payment_id: uuidv4(),
        razorpay_signature: uuidv4(),
      };

      const [payment] = await tx
        .insert(Payments)
        .values({
          orderId: order.id,
          provider: "RAZORPAY",
          providerOrderId: Razorpay.razorpay_order_id,
          providerPaymentId: Razorpay.razorpay_payment_id,
          providerSignature: Razorpay.razorpay_signature,
          status: PaymentStatus.Pending,
          amount: totalAmount.toFixed(2),
        })
        .returning();

      if (!payment) {
        throw new Error("Failed to create payment record");
      }

      const orderItemsPayload = customerCart.map((r) => ({
        orderId: order.id,
        bookId: r.bookId,
        quantity: r.quantity,
        price: String(r.price ?? "0"),
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      if (orderItemsPayload.length) {
        await tx.insert(orderItems).values(orderItemsPayload);
        // clear user cart
        await tx.delete(CartItems).where(eq(CartItems.userId, userId));
      }

      if (outOfStockItems.length > 0) {
        return {
          message: "few items are out of stock",
          outOfStockItems,
          order,
          totalAmount,
          payment: {
            id: payment.id,
            provider: "RAZORPAY",
            amount: payment.amount,
            status: payment.status,
            ...Razorpay,
          },
        };
      } else
        return {
          order,
          totalAmount,
          payment: {
            id: payment.id,
            provider: "RAZORPAY",
            amount: payment.amount,
            status: payment.status,
            ...Razorpay,
          },
        };
    });

    res
      .status(201)
      .json(ApiResponse(201, created, "Order placed successfully"));
  } catch (error: any) {
    if (error instanceof Error) {
      res
        .status(500)
        .json(ApiError(500, "Internal Server Error", req, [error.message]));
    } else {
      res
        .status(500)
        .json(
          ApiError(500, "Internal Server Error", req, [
            error.cause
              ? error.cause
              : error.message || "An unexpected error occurred",
          ]),
        );
    }
  }
};

const verifyPayment = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res
      .status(401)
      .json(ApiError(401, "Unauthorized", req, ["User not authenticated"]));
    return;
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res
      .status(400)
      .json(ApiError(400, "Bad Request", req, ["invalid payload"]));
    return;
  }
  try {
    // Verify
    const isValid = db.transaction(async (tx) => {
      const [payment] = await tx
        .select()
        .from(Payments)
        .where(eq(Payments.providerOrderId, razorpay_order_id))
        .limit(1);

      if (payment.providerPaymentId !== razorpay_payment_id) {
        await tx
          .update(Payments)
          .set({ status: PaymentStatus.Failed, updatedAt: new Date() })
          .where(eq(Payments.providerOrderId, razorpay_order_id));

        await tx
          .update(Orders)
          .set({ status: OrderStatus.Failed, updatedAt: new Date() })
          .where(eq(Orders.id, razorpay_order_id));

        return false;
      }
      return true;
    });

    if (!isValid) {
      res
        .status(400)
        .json(ApiError(400, "Bad Request", req, ["Invalid payment details"]));
      return;
    }

    const [order] = await db
      .select()
      .from(Orders)
      .where(and(eq(Orders.id, razorpay_order_id), eq(Orders.userId, userId)))
      .limit(1);

    if (!order) {
      res
        .status(404)
        .json(ApiError(404, "Order not found", req, ["Invalid order id"]));
      return;
    }

    if (order.status === OrderStatus.Fulfilled) {
      res.status(200).json(ApiResponse(200, {}, "Order already fulfilled"));
      return;
    }

    // Fetch items and books to update stock
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    const bookIds = items.map((i) => i.bookId);

    const dbBooks = await db
      .select({
        id: Books.id,
        title: Books.title,
        price: Books.price,
        stock: Books.stock,
      })
      .from(Books)
      .where(inArray(Books.id, bookIds));

    // Transaction: subtract stock, update ordert, send email
    await db.transaction(async (tx) => {
      // subtract stock
      for (const it of items) {
        const book = dbBooks.find((b) => b.id === it.bookId)!;
        await tx
          .update(Books)
          .set({ stock: book.stock - it.quantity })
          .where(eq(Books.id, it.bookId));
      }
      // update order and payment to paid
      await tx
        .update(Orders)
        .set({ status: OrderStatus.Fulfilled, updatedAt: new Date() })
        .where(and(eq(Orders.id, order.id), eq(Orders.userId, userId)));

      await tx
        .update(Payments)
        .set({ status: PaymentStatus.Paid, updatedAt: new Date() })
        .where(eq(Payments.providerOrderId, razorpay_order_id));
    });

    // send email
    if (req.user?.email) {
      // Generate order table data for email
      const itemLines = generateOrderTableData(items, dbBooks);
      const orderDetails = {
        id: order.id,
        totalAmount: Number(order.totalAmount),
      };
      // Generate HTML for email
      const emailHTML = generateOrderEmailHTML(orderDetails, itemLines);

      console.log("333333333333333333333333333333333333");

      await sendOrderConfirmationEmail(
        req.user?.email,
        `Your BookBazaar order ${order.id} is confirmed`,
        emailHTML,
      );
    }
    console.log("4444444444444444444444444444444444444444");
    res.status(200).json(ApiResponse(200, {}, "Order paid successfully"));
    return;
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    res
      .status(500)
      .json(
        ApiError(500, "Internal Server Error", req, [
          error.cause
            ? error.cause
            : error.message || "An unexpected error occurred",
        ]),
      );
    return;
  }
};

const listMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res
        .status(401)
        .json(ApiError(401, "Unauthorized", req, ["User not authenticated"]));
      return;
    }

    const page = Math.max(1, Number(req.query.page ?? 1));
    const pageSize = Math.min(
      100,
      Math.max(1, Number(req.query.pageSize ?? 10)),
    );
    const offset = (page - 1) * pageSize;

    const orders = await db
      .select({
        id: Orders.id,
        totalAmount: Orders.totalAmount,
        status: Orders.status,
        createdAt: Orders.createdAt,
      })
      .from(Orders)
      .where(eq(Orders.userId, userId))
      .orderBy(desc(Orders.createdAt))
      .limit(pageSize)
      .offset(offset);

    const result = await db.execute<{ count: number }>(
      sql`SELECT COUNT(*)::int as count FROM "orders" WHERE "user_id" = ${userId}`,
    );

    const count = result.rows[0]?.count ?? 0;

    res
      .status(200)
      .json(
        ApiResponse(
          200,
          { orders: orders, page, pageSize, total: Number(count) },
          "Orders fetched",
        ),
      );
  } catch (error: any) {
    res
      .status(500)
      .json(
        ApiError(
          500,
          "Internal Server Error",
          req,
          error instanceof Error
            ? [error.message]
            : [
                error.cause
                  ? error.cause
                  : error.message || "An unexpected error occurred",
              ],
        ),
      );
    return;
  }
};

const getOrderById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res
        .status(401)
        .json(ApiError(401, "Unauthorized", req, ["User not authenticated"]));
      return;
    }

    const orderId = req.params.id;

    if (!orderId) {
      res
        .status(400)
        .json(ApiError(400, "Bad Request", req, ["Order ID is required"]));
      return;
    }

    const [order] = await db
      .select()
      .from(Orders)
      .where(and(eq(Orders.id, orderId), eq(Orders.userId, userId)))
      .limit(1);

    if (!order) {
      res
        .status(404)
        .json(ApiError(404, "Order not found", req, ["Invalid order id"]));
      return;
    }

    const order_items = await db
      .select({
        id: orderItems.id,
        bookId: orderItems.bookId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        title: Books.title,
        author: Books.author,
        isbn: Books.isbn,
      })
      .from(orderItems)
      .leftJoin(Books, eq(Books.id, orderItems.bookId))
      .where(eq(orderItems.orderId, orderId));

    res
      .status(200)
      .json(ApiResponse(200, { order, order_items }, "Order details fetched"));
    return;
  } catch (error: any) {
    res
      .status(500)
      .json(
        ApiError(
          500,
          "Internal Server Error",
          req,
          error instanceof Error
            ? [error.message]
            : [
                error.cause
                  ? error.cause
                  : error.message || "An unexpected error occurred",
              ],
        ),
      );
    return;
  }
};

const cancelOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res
        .status(401)
        .json(ApiError(401, "Unauthorized", req, ["User not authenticated"]));
      return;
    }

    const orderId = req.params.id;
    if (!orderId) {
      res
        .status(400)
        .json(ApiError(400, "Bad Request", req, ["Order ID is required"]));
      return;
    }

    const [order] = await db
      .select()
      .from(Orders)
      .where(and(eq(Orders.id, orderId), eq(Orders.userId, userId)))
      .limit(1);

    if (!order) {
      res
        .status(404)
        .json(ApiError(404, "Order not found", req, ["Invalid order id"]));
      return;
    }

    const [updatedOrder] = await db
      .update(Orders)
      .set({ status: OrderStatus.Cancelled, updatedAt: new Date() })
      .where(and(eq(Orders.id, orderId), eq(Orders.userId, userId)))
      .returning();

    await db
      .update(Payments)
      .set({ status: PaymentStatus.Refunded, updatedAt: new Date() })
      .where(eq(Payments.providerOrderId, orderId))
      .returning();

    let message = "Order cancelled successfully";

    if (order.status === OrderStatus.Fulfilled) {
      message = "Order cancelled and payment refunded initialized";
    }

    res.status(200).json(ApiResponse(200, updatedOrder, message));
    return;
  } catch (error: any) {
    res
      .status(500)
      .json(
        ApiError(
          500,
          "Internal Server Error",
          req,
          error instanceof Error
            ? [error.message]
            : [
                error.cause
                  ? error.cause
                  : error.message || "An unexpected error occurred",
              ],
        ),
      );
    return;
  }
};

export { placeOrder, verifyPayment, listMyOrders, getOrderById, cancelOrder };
