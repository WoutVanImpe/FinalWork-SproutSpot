import { Router } from "express";
import { ProbeController } from "../controllers/probe.controller";
import { validateBody } from "../middlewares/validation.middleware";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
const controller = new ProbeController();

router.post("/register", validateBody(["hardware_id", "name", "pairing_code"]), controller.registerProbe);

router.use(authenticate);

router.get("/", controller.getUserProbes);
router.get("/:id", controller.getUserProbes);
router.post("/:id/pair", validateBody(["user_plant_id"]), controller.pairProbe);
router.post("/unpair/:userPlantId", controller.unpairProbe);

export default router;
