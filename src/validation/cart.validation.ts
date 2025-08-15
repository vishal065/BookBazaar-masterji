import z from "zod";

const cartSchema = z.object({
    userId: z.uuid().min(1, { message: "User ID is required" }),
    bookId: z.uuid().min(1, {
        message: "Book ID is required"
    }),
    quantity: z.number().int().min(0, { message: "Quantity must be a positive integer" }).default(1),
});


export { cartSchema };