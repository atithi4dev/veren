import Router from "express";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import { updateEnv, getEnv } from "../controllers/env.controller.js";

const router = Router();


router.route("/:projectId")
    .get(verifyJwt, getEnv);

router.route("/:projectId")
    .patch(verifyJwt,updateEnv);

export default router;