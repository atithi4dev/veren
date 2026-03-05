/**
 * @openapi
 * /api/v1/healthcheck:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns a simple health status for the API.
 *     responses:
 *       200:
 *         description: API is healthy
 */
import { Router } from "express";
import healthCheck from "../controllers/healthCheck.controller.js";

const router = Router();

router.route("/").get(healthCheck);

export default router;