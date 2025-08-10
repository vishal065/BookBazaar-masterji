import { Router } from "express"
import { generateApiKey, getMe, login, logout, register } from "./auth.controller"
import { authMiddleware } from "../../middlewares/auth.middleware"
import asyncHandler from "../../utils/asyncHandler"
import { validateBody } from "../../middlewares/validateBody.middleware"
import { loginSchema, registerSchema } from "../../validation/auth.validation"



const router = Router()

router.route("/register").post(validateBody(registerSchema), asyncHandler(register))
router.route("/login").post(validateBody(loginSchema), asyncHandler(login))
router.route("/me").get(authMiddleware, asyncHandler(getMe))
router.route("/logout").post(authMiddleware, asyncHandler(logout))


router.route("/api-key").get(asyncHandler(generateApiKey))




export { router as AuthRouter }