import { Router } from "express";
import { UserPlantController } from "../controllers/userPlant.controller";
import { validateBody } from "../middlewares/validation.middleware";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
const controller = new UserPlantController();

router.use(authenticate);

router.post("/", validateBody(["plant_id", "nickname", "x_pos", "y_pos"]), controller.createUserPlant);
router.get("/", controller.getAllUserPlants);
router.get("/active", controller.getAllActiveUserPlants);
router.post("/:id/stage", validateBody(["new_stage_order"]), controller.updateStage);
router.get("/:id/stage", controller.getCurrentStage);
router.get("/:id/readings", controller.getLastReadings);

export default router;
