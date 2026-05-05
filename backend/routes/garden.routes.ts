import { Router } from "express";
import { GardenController } from "../controllers/garden.controller";
import { validateBody } from "../middlewares/validation.middleware";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
const controller = new GardenController();

router.use(authenticate);

router.get("/", controller.getUserGardens);
router.get("/:id", controller.getGardenDetails);
router.put("/:id/dimensions", validateBody(["width", "height"]), controller.updateDimensions);

export default router;
