import { Router } from "express";
import {getAllRepositoryOfCurrentUser, repoFinder} from "../controllers/repo.controller.js";
const router = Router();

router.route("/getrepo").get(getAllRepositoryOfCurrentUser);
router.route("/find").get(repoFinder);

export default router;