import z from "zod";

const BookSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  author: z.string().min(1, { message: "Author is required" }),
  genre: z.string().optional(),
  description: z.string().optional(),
  isbn: z.string().min(1, { message: "ISBN is required" }),
  price: z.number().min(0, { message: "Price must be a positive number" }),
  stock: z
    .number()
    .int()
    .min(0, { message: "Stock must be a non-negative integer" })
    .default(0),
});

export { BookSchema };
