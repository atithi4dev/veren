import {Router} from "express"
import operationalController from "../controllers/operational.controller.js";
const router = Router();

router.route("/").post(operationalController);

export default router;