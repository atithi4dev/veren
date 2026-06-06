import { Router } from "express"
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import {deployProject, deployTo, getDeployment, getAllUserDeployment,roleBackProject} from "../controllers/deployment.controller.js"
const router = Router();

router.use(verifyJwt);

router.route("/")
    .get(verifyJwt, getAllUserDeployment)

router.route("/:depoymentId")
    .get(verifyJwt, getDeployment)

router.route('/deploy/:projectId')
    .get(deployProject)
router.route('/deployTo/:projectId')
    .post(deployTo)
router.route('/r/:projectId')
    .post(roleBackProject)

export default router;