import { Router } from "express"
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import {deployProject} from "../controllers/deployment.controller.js"
const router = Router();

router.use(verifyJwt);

router.route('/:projectId')
    .get(deployProject)

export default router;