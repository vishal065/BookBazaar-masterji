import z from "zod";

const cartSchema = z.object({
  bookId: z.string(),
  quantity: z
    .number()
    .int()
    .min(0, { message: "Quantity must be a positive integer" })
    .default(1),
});

export { cartSchema };
