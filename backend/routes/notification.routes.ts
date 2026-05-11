import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
const controller = new NotificationController();

router.use(authenticate);

router.get("/", controller.getUserNotifications);
router.post("/:notificationId/acknowledge", controller.acknowledgeNotification);
router.post("/issues/:issueId/resolve", controller.resolveIssue);
router.post("/:notificationId/reset", controller.resetNotificationState);

export default router;
