import { Router } from "express"
import { generateApiKey, getMe, login, register } from "./auth.controller"
import { authMiddleware } from "../../middlewares/auth.middleware"



const router = Router()

router.post("/register", register)
router.post("/login", login)
router.post("/api-key", authMiddleware, generateApiKey)
router.get("/me", authMiddleware, getMe)



export default router