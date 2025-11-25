import { Router } from "express";
import {repoHandler, repoFinder} from "../controllers/repo.controller.js";
const router = Router();

router.route("/getrepo").get(repoHandler);
router.route("/find").get(repoFinder);

export default router;