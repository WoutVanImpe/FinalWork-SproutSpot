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

const app = express();

app.use(cors());
app.use(express.json());

app.use("/images", express.static(path.join(__dirname, "public")));

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
});

export default app;
