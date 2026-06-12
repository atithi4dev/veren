import express from "express";
import {githubWebhookController} from "../controllers/webhook.controller.js";
const router = express.Router();

router.route("/github").post(express.raw({ type: "*/*" }),githubWebhookController)

export default router;