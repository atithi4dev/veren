import { Router } from "express";
import {RouteHandler} from "../controllers/router.controller.js";
const router = Router();

router.route("/").get(RouteHandler);

export default router;