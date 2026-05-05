import { Router } from "express";
import { TelemetryController } from "../controllers/telemetry.controller";
import { validateBody } from "../middlewares/validation.middleware";

const router = Router();
const controller = new TelemetryController();

const TELEMETRY_FIELDS = ["hardware_id", "temp_c", "humidity_pct", "light_lux", "soil_raw", "battery_voltage", "wifi_rssi"];

router.post("/ingest", validateBody(TELEMETRY_FIELDS), controller.receiveTelemetry);
router.get("/recent/:sondeId", controller.getRecentTelemetry);

export default router;
