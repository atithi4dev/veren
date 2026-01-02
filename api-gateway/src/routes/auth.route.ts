import { Router } from "express";
import { LoginController, CallbackController, logOutController, getMe } from "../controllers/auth.controller.js"
import { verifyJwt } from "../middlewares/auth.middlewares.js";
const router = Router();

//LOGIN ROUTE - Manages both signup and login
router.get("/login", LoginController);

router.get("/callback",CallbackController)

router.get("/logout",logOutController)

router.get("/me", verifyJwt,getMe)


export default router;