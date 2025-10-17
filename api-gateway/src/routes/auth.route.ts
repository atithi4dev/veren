import { Router } from "express";
import { repoHandler } from "../controllers/repo.controller.js";
import { LoginController, CallbackController } from "../controllers/auth.controller.js"
const router = Router();

//LOGIN ROUTE
router.get("/github", LoginController);

router.get("/callback",CallbackController)

router.route("/getrepo").get(repoHandler);

export default router;