import { Router } from "express"
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import {deployProject, deployTo, roleBackProject} from "../controllers/deployment.controller.js"
const router = Router();

router.use(verifyJwt);

router.route('/:projectId')
    .get(deployProject)
router.route('/d/:projectId')
    .post(deployTo)
router.route('/r/:projectId')
    .post(roleBackProject)

export default router;