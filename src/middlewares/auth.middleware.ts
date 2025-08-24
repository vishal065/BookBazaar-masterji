import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Users } from "../model/user.model";
import { db } from "../config/db";
import { eq } from "drizzle-orm";
import EnvSecret from "../constants/envVariables";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    authHeader = req.cookies?.token;
  }

  if (!authHeader) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const decoded = (await jwt.verify(token, EnvSecret.JWT_SECRET)) as {
      id: string;
      role: string;
    };
    if (!decoded) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    const [user] = await db
      .select({
        id: Users.id,
        email: Users.email,
        role: Users.role,
      })
      .from(Users)
      .where(eq(Users.id, decoded.id))
      .limit(1);

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
    return;
  }
};
