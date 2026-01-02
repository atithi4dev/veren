import { Router } from "express"
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import {
    createProject,
    getProjectConfigUser,
    // updateProjectConfigUser,
    getAllProjects
} from "../controllers/projects.controller.js";
import { updateEnv } from "../controllers/env.controller.js";
const router = Router()

/*  IT IS FOR USER ACCESS ONLY  */
router.route("/")
    .post(verifyJwt, createProject)
    .get(verifyJwt, getAllProjects)

router.route("/:projectId")
    .get(verifyJwt, getProjectConfigUser)

router.route("/:projectId/env")
    .patch(verifyJwt,updateEnv)


export default router;