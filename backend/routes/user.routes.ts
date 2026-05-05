import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { validateBody } from "../middlewares/validation.middleware";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
const controller = new UserController();

router.post("/signup", validateBody(["name", "email", "password"]), controller.signup);
router.post("/login", validateBody(["email", "password"]), controller.login);

router.use(authenticate);

router.get("/profile", controller.getProfile);
router.put("/profile", controller.updateProfile);
router.put("/push-token", validateBody(["push_token"]), controller.updatePushToken);

export default router;
