import { z } from "zod";

// placing from cart → no body required, but keep a stub for future extension
const placeOrderSchema = z.object({}).optional();

// optional pagination for GET /orders
const listOrdersQuerySchema = z.object({
  page: z.string().optional(), // parse in controller
  pageSize: z.string().optional(), // parse in controller
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;

export { placeOrderSchema, listOrdersQuerySchema };
