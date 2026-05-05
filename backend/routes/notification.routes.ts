import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
const controller = new NotificationController();

router.use(authenticate);

router.get("/", controller.getUserNotifications);
router.get("/issues", controller.getUserActiveIssues);
router.post("/issues/:issueId/acknowledge", controller.acknowledgeIssue);
router.post("/issues/:issueId/resolve", controller.resolveIssue);
router.post("/:notificationId/snooze", controller.snoozeNotification);
router.post("/:notificationId/acknowledge", controller.acknowledgeNotification);

export default router;
