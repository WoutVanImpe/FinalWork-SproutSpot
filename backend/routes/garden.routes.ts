import { Router } from "express";
import { GardenController } from "../controllers/garden.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
const controller = new GardenController();

router.use(authenticate);

router.get("/", controller.getUserGarden);
router.put("/", controller.updateGarden);

export default router;
