import { Router } from "express"
import { generateApiKey, getMe, login, logout, register } from "./auth.controller"
import { authMiddleware } from "../../middlewares/auth.middleware"
import asyncHandler from "../../utils/asyncHandler"



const router = Router()

router.route("/register").post(asyncHandler(register))
router.route("/login").post(asyncHandler(login))
router.route("/me").get(authMiddleware, asyncHandler(getMe))
router.route("/logout").post(authMiddleware, asyncHandler(logout))


router.route("/api-key").get(asyncHandler(generateApiKey))




export { router as AuthRouter }