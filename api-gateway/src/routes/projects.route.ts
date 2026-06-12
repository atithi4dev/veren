import { Router } from "express"
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import {
    createBackendProject,
    createFrontendProject,
    // updateProjectConfigUser,
    getAllProjects
} from "../controllers/projects.controller.js";
const router = Router()

/*  IT IS FOR USER ACCESS ONLY  */
router.route("/g")
    .get(verifyJwt, getAllProjects)

router.route("/f")
    .post(verifyJwt, createFrontendProject)
    
router.route("/b")
    .post(verifyJwt, createBackendProject)

export default router;