import { Router } from "express"
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import {getProjectConfigBuild,updateProjectConfigBuild,updateProjectConfigClone} from "../controllers/internalService.controller.js"
const router = Router();

/*  IT IS FOR INTERNAL WORKER MODULES  */
router.route("/:projectId/clone-metadata")
    .patch(updateProjectConfigClone)

router.route("/:projectId/build-metadata")
    .get(getProjectConfigBuild)
    .patch(updateProjectConfigBuild)


export default router;