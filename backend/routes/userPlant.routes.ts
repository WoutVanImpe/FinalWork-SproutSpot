import { Router } from "express";
import { UserPlantController } from "../controllers/userPlant.controller";
import { validateBody } from "../middlewares/validation.middleware";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
const controller = new UserPlantController();

router.use(authenticate);

router.get("/", controller.getUserPlants);
router.get("/active", controller.getActivePlants);
router.get("/:id", controller.getPlantDetails);
router.post("/", validateBody(["plant_id", "x_pos", "y_pos"]), controller.createPlant);
router.post("/:id/advance-stage", validateBody(["new_stage_order"]), controller.advanceStage);
router.post("/:id/deactivate", validateBody(["reason"]), controller.deactivatePlant);
router.put("/:id/move", validateBody(["garden_id", "x_pos", "y_pos"]), controller.movePlant);
router.get("/match/:plantId", controller.calculateMatch);

export default router;
