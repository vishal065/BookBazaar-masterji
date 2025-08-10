import { Router } from "express"
import asyncHandler from "../utils/asyncHandler"
import { generateApiKey, getMe, login, logout, register } from "./auth/auth.controller"



const router = Router()

router.route("/register").post(asyncHandler(register))
router.route("/login").post(asyncHandler(login))
router.route("/me").get(asyncHandler(getMe))
router.route("/logout").post(asyncHandler(logout))


router.route("/api-key").get(asyncHandler(generateApiKey))




export default router