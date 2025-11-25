import { Router } from "express";
import serveHandler from "../controllers/frontend.controller.js";

const router = Router();

router.route("/").get(serveHandler);

export default router;