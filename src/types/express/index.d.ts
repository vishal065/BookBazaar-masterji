import type { User } from "../model/user.model";

declare global {
  namespace Express {
    export interface Request {
      user?: {
        id: string;
        email: string;
        role: "ADMIN" | "CUSTOMER";
      };
    }
  }
}
