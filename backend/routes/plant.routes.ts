import { Router } from "express";
import { PlantController } from "../controllers/plant.controller";

const router = Router();
const controller = new PlantController();

router.get("/", controller.getAllPlants);
router.get("/search", controller.searchPlants);
router.get("/:id", controller.getPlantById);
router.get("/:id/stages", controller.getPlantStages);

export default router;
