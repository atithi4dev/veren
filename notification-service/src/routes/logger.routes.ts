import Router from "express";
import {logStatic, logStream} from "../controllers/logs.controller.js"
const router = Router();

router.route("/:deploymentId/stream")
    .get(logStream)
router.route("/:deploymentId/static")
    .get(logStatic)

export default router;