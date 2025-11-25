import urlController from "../controllers/urlController.controller.js";

import { Router } from "express";
const router = Router();

router.route("/").post(urlController);

export default router;