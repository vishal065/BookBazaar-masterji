import { z } from "zod";

const passwordStrength = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .regex(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter",
  })
  .regex(/[a-z]/, {
    message: "Password must contain at least one lowercase letter",
  })
  .regex(/\d/, { message: "Password must contain at least one number" })
  .regex(/[^A-Za-z0-9]/, {
    message: "Password must contain at least one special character",
  });

const registerSchema = z.object({
  email: z.email({
    error: "Invalid email format",
  }),

  password: passwordStrength,
});

const loginSchema = z.object({
  email: z.email({
    error: "Invalid email format",
  }),
  password: z.string().min(8, {
    error: "Password must be at least 8 characters long",
  }),
});

export { registerSchema, loginSchema };
