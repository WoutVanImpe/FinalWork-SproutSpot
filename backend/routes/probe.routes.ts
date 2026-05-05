import { Router } from "express";
import { ProbeController } from "../controllers/probe.controller";
import { validateBody } from "../middlewares/validation.middleware";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
const controller = new ProbeController();

router.post("/register", validateBody(["hardware_id", "name"]), controller.registerProbe);
router.get("/available", controller.getAvailableProbes);

router.use(authenticate);

router.get("/", controller.getUserProbes);
router.post("/:id/pair", controller.pairProbe);
router.post("/:id/unpair", controller.unpairProbe);

export default router;
