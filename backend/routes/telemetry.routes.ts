import { Router } from "express";
import { TelemetryController } from "../controllers/telemetry.controller";
import { validateBody } from "../middlewares/validation.middleware";

const router = Router();
const controller = new TelemetryController();

router.post("/upload", validateBody(["hardware_id", "entries"]), controller.uploadTelemetry);
router.get("/recent/:sondeId", controller.getRecentTelemetry);

export default router;
