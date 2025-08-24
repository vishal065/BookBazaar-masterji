import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { db } from "../../config/db";
import EnvSecret, {
  EApplicationEnviroment,
} from "../../constants/envVariables";
import { Users } from "../../model/user.model";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";

const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { superAdminKey } = req.query;

    const existingUser = await db
      .select()
      .from(Users)
      .where(eq(Users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      res
        .status(409)
        .json(
          ApiError(409, "User already exists", req, [
            "Email is already registered",
          ]),
        );
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let userRole: "ADMIN" | "CUSTOMER" = "CUSTOMER";

    if (superAdminKey === EnvSecret.SUPER_ADMIN_KEY) {
      userRole = "ADMIN";
    }

    const userToInsert = {
      email,
      password: hashedPassword,
      role: userRole,
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    const [result] = await db
      .insert(Users)
      .values(userToInsert)
      .returning({ id: Users.id });

    if (!result) {
      res
        .status(500)
        .json(
          ApiError(500, "Failed to register user", req, [
            "An error occurred while registering the user",
          ]),
        );
      return;
    }

    res
      .status(201)
      .json(ApiResponse(201, undefined, "User registered successfully"));
    return;
  } catch (error) {
    res
      .status(500)
      .json(
        ApiError(500, "Server error", req, [
          "An error occurred while registering the user",
        ]),
      );
    return;
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const [user] = await db.select().from(Users).where(eq(Users.email, email));

    if (!user) {
      res
        .status(400)
        .json(ApiError(400, "Invalid credentials", req, ["User not found"]));
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res
        .status(400)
        .json(
          ApiError(400, "Invalid credentials", req, ["Incorrect password"]),
        );
      return;
    }

    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const { password: userPassword, ...logedinUser } = user; // Exclude password from user object

    const token = jwt.sign(
      { id: user.id, role: user.role },
      EnvSecret.JWT_SECRET!,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: EnvSecret.NODE_ENV !== EApplicationEnviroment.DEVELOPMENT,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res
      .status(200)
      .json(ApiResponse(200, { token, ...logedinUser }, "Login successful"));
    return;
  } catch (error: any) {
    res
      .status(500)
      .json(
        ApiError(
          500,
          "Server error",
          req,
          error.message ? [error.message] : ["An error occurred"],
        ),
      );
    return;
  }
};

const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json(ApiError(401, "Unauthorized", req, ["User not authenticated"]));
      return;
    }
    const [user] = await db
      .select()
      .from(Users)
      .where(eq(Users.id, req.user.id))
      .limit(1);

    if (!user) {
      res
        .status(404)
        .json(
          ApiError(404, "User not found", req, [
            "No user found with the provided ID",
          ]),
        );
      return;
    }

    res.json(ApiResponse(200, user, "User retrieved successfully"));
    return;
  } catch (error) {
    res
      .status(500)
      .json(
        ApiError(500, "Server error", req, [
          "An error occurred while retrieving user information",
        ]),
      );
    return;
  }
};

const logout = async (_req: Request, res: Response) => {
  try {
    const userId = _req?.user?.id;
    if (!userId) {
      res
        .status(400)
        .json(
          ApiError(400, "Invalid request", _req, ["User ID is not provided"]),
        );
      return;
    }
    res.clearCookie("token");
    res.status(200).json(ApiResponse(200, null, "Logout successful"));
    return;
  } catch (error) {}
};

export { register, login, logout, getMe };
