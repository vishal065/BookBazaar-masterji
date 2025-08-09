import { Request, Response } from "express"
import bcrypt from "bcrypt"
import { eq } from "drizzle-orm"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import { db } from "../../config/db"
import EnvSecret from "../../constants/envVariables"
import { usersModel } from "../../model/user.model"
import { apiKeysModel } from "../../model/api-key.model"
import { ApiResponse } from "../../utils/ApiResponse"
import { ApiError } from "../../utils/ApiError"


export const register = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        const existingUser = await db.select()
            .from(usersModel)
            .where(eq(usersModel.email, email))
            .limit(1)

        if (existingUser.length > 0) {
            res.status(409).json(ApiError(409, "User already exists", req, ["Email is already registered"]))
            return
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const userToInsert = {
            email,
            password: hashedPassword,
            isAdmin: false,
            createdAt: new Date(),
            lastLogin: new Date(),
        }

        const [result] = await db.insert(usersModel)
            .values(userToInsert)
            .returning({ id: usersModel.id })

        if (!result) {
            res.status(500).json(ApiError(500, "Failed to register user", req, ["An error occurred while registering the user"]))
            return
        }
        
        res.status(201).json(ApiResponse(201, null, "User registered successfully"))
        return
    } catch (error) {
        res.status(500).json(ApiError(500, "Server error", req, ["An error occurred while registering the user"]))
        return
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        const [user] = await db.select()
            .from(usersModel)
            .where(eq(usersModel.email, email))
            .limit(1)

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
            { userId: user.id, role: user.isAdmin },
            EnvSecret.JWT_SECRET!,
            { expiresIn: "7d" },
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: EnvSecret.NODE_ENV !== "development",
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
}

export const generateApiKey = async (req: Request, res: Response) => {
    try {
        const userId = req?.user?.id
        const key = crypto.randomBytes(24).toString("hex")

        if (!userId) {
            res.status(400).json(ApiError(400, "User ID is required", req, ["User ID is not provided"]))
            return
        }

        const result = await db.insert(apiKeysModel)
            .values({
                userId,
                key,
            })
            .returning({ id: apiKeysModel.id })

        if (!result) {
            res.status(500).json(ApiError(500, "Failed to generate API key", req, ["An error occurred while generating API key"]))
            return
        }

        res.status(201).json(ApiResponse(201, { apiKey: key }, "API key generated successfully"))
        return

    } catch (error: any) {
        res.status(500).json(ApiError(500, "Server error", req, [error.message || "An error occurred while generating API key"]))
        return
    }
}

export const getMe = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json(ApiError(401, "Unauthorized", req, ["User not authenticated"]))
            return
        }
        const [user] = await db.select().from(usersModel).where(eq(usersModel.id, req.user.id)).limit(1)

        if (!user) {
            res.status(404).json(ApiError(404, "User not found", req, ["No user found with the provided ID"]))
            return
        }

        res.json(ApiResponse(200, user, "User retrieved successfully"))
        return
    } catch (error) {
        res.status(500).json(ApiError(500, "Server error", req, ["An error occurred while retrieving user information"]))
        return
    }
}
