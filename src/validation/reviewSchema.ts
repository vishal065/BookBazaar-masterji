import z from "zod";

export const reviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, { message: "Rating must be at least 1" })
    .max(5, { message: "Rating cannot be more than 5" }),
  comment: z.string().optional(),
});
