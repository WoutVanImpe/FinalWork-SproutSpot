import express from "express";
import path from "path";
import cors from "cors";
import { PORT } from "./config";

import { errorHandler } from "./middlewares/error.middleware";

import userRoutes from "./routes/user.routes";
import gardenRoutes from "./routes/garden.routes";
import plantRoutes from "./routes/plant.routes";
import userPlantRoutes from "./routes/userPlant.routes";
import probeRoutes from "./routes/probe.routes";
import telemetryRoutes from "./routes/telemetry.routes";
import notificationRoutes from "./routes/notification.routes";
import { startScheduler } from "./services/scheduler.service";

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(process.cwd(), "public")));

app.use("/api/users", userRoutes);
app.use("/api/gardens", gardenRoutes);
app.use("/api/plants", plantRoutes);
app.use("/api/user-plants", userPlantRoutes);
app.use("/api/probes", probeRoutes);
app.use("/api/telemetry", telemetryRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	startScheduler();
});

export default app;
